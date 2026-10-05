-- ==============================================================================
-- HOGWARTS DUEL 3D: DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Chạy script này tại: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Dự án: fxucyrofcsuqtlkukcrx (Đồng bộ cùng 7-Potters & Undercover Hogwarts)
-- ==============================================================================

-- 1. BẢNG PHÒNG THI ĐẤU (DUEL_ROOMS)
CREATE TABLE IF NOT EXISTS public.duel_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(12) UNIQUE NOT NULL,                       -- Mã phòng (VD: 'HOGW-7788')
    host_id VARCHAR(64) NOT NULL,                          -- ID định danh của chủ phòng
    host_name VARCHAR(60) NOT NULL DEFAULT 'Harry Potter', -- Tên hiển thị chủ phòng
    host_deck JSONB NOT NULL DEFAULT '[]'::jsonb,          -- Bộ 4 bùa của chủ phòng
    guest_id VARCHAR(64) NULL,                             -- ID định danh khách đấu
    guest_name VARCHAR(60) NULL,                           -- Tên hiển thị khách đấu
    guest_deck JSONB NULL DEFAULT '[]'::jsonb,             -- Bộ 4 bùa của khách đấu
    status VARCHAR(20) NOT NULL DEFAULT 'LOBBY',           -- 'LOBBY' | 'DUELING' | 'FINISHED'
    winner VARCHAR(20) NULL,                               -- 'HOST' | 'GUEST' | 'DRAW'
    is_public BOOLEAN NOT NULL DEFAULT true,               -- Hiển thị trong Sảnh Chờ công khai
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now()    -- Dùng cho TTL cleanup phòng cũ
);

CREATE INDEX IF NOT EXISTS idx_duel_rooms_code ON public.duel_rooms(code);
CREATE INDEX IF NOT EXISTS idx_duel_rooms_status ON public.duel_rooms(status, is_public);
CREATE INDEX IF NOT EXISTS idx_duel_rooms_activity ON public.duel_rooms(last_activity_at);

-- 2. BẢNG LỊCH SỬ TRẬN ĐẤU (DUEL_MATCH_HISTORY)
CREATE TABLE IF NOT EXISTS public.duel_match_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(12) NOT NULL,
    host_name VARCHAR(60) NOT NULL,
    guest_name VARCHAR(60) NOT NULL,
    winner VARCHAR(20) NOT NULL,                           -- 'HOST' | 'GUEST' | 'DRAW'
    winner_name VARCHAR(60) NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 0,
    host_deck JSONB NOT NULL DEFAULT '[]'::jsonb,
    guest_deck JSONB NOT NULL DEFAULT '[]'::jsonb,
    spells_cast_total INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_duel_history_winner ON public.duel_match_history(winner_name);
CREATE INDEX IF NOT EXISTS idx_duel_history_created ON public.duel_match_history(created_at DESC);

-- 3. BẢNG BẢNG XẾP HẠNG PHÁP SƯ (DUEL_LEADERBOARD)
CREATE TABLE IF NOT EXISTS public.duel_leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    duelist_name VARCHAR(60) UNIQUE NOT NULL,
    house VARCHAR(20) NOT NULL DEFAULT 'GRYFFINDOR',
    elo_rating INT NOT NULL DEFAULT 1200,
    matches_played INT NOT NULL DEFAULT 0,
    wins INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    win_streak INT NOT NULL DEFAULT 0,
    favorite_spell VARCHAR(30) NULL DEFAULT 'expelliarmus',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_duel_leaderboard_elo ON public.duel_leaderboard(elo_rating DESC);

-- 4. BẬT ROW LEVEL SECURITY (RLS)
ALTER TABLE public.duel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_leaderboard ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc công khai danh sách phòng đang chờ và bảng xếp hạng
DROP POLICY IF EXISTS "Public can view open rooms" ON public.duel_rooms;
CREATE POLICY "Public can view open rooms" ON public.duel_rooms
    FOR SELECT USING (is_public = true AND status = 'LOBBY');

DROP POLICY IF EXISTS "Public can view leaderboard" ON public.duel_leaderboard;
CREATE POLICY "Public can view leaderboard" ON public.duel_leaderboard
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view match history" ON public.duel_match_history;
CREATE POLICY "Public can view match history" ON public.duel_match_history
    FOR SELECT USING (true);

-- 5. BẬT REALTIME PUBLICATION CHO SUPABASE
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'duel_rooms'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_rooms;
    END IF;
END $$;

-- 6. HÀM TỰ ĐỘNG DỌN DẸP PHÒNG CŨ (TTL CLEANUP)
-- Xóa các phòng bỏ dở không hoạt động quá 2 tiếng
CREATE OR REPLACE FUNCTION cleanup_stale_duel_rooms() 
RETURNS INT AS $$
DECLARE
    deleted_count INT;
BEGIN
    DELETE FROM public.duel_rooms 
    WHERE last_activity_at < now() - INTERVAL '2 hours'
       OR (status = 'FINISHED' AND updated_at < now() - INTERVAL '15 minutes');
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
