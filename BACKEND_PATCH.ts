// =====================================================
// FULL FIXED socket/handler.ts for your backend
// Replace your entire socket/handler.ts with this file
// =====================================================

import { Server, Socket } from "socket.io";
import { redis } from "../config/redis.js";
import { getDistance } from "../utils/geo.js";

export const socketHandler = (io: Server, socket: Socket) => {

    // ── LAYER 1: Ghost Radar Feed ──
    socket.on("get_nearby_rooms", async ({ userLat, userLng }) => {
        const keys = await redis.keys("room:*");
        const nearbyRooms = [];
        for (const key of keys) {
            const room: any = await redis.hgetall(key);
            if (room && room.lat) {
                const dist = getDistance(userLat, userLng, Number(room.lat), Number(room.lng));
                if (dist <= 500) nearbyRooms.push({ id: key, name: room.name, dist, heat: room.heat });
            }
        }
        socket.emit("radar_feed", nearbyRooms);
    });

    // ── LAYER 2: Handshake ──

    // Admin joins their own room right after creating it
    socket.on("admin_join_room", async ({ roomId }) => {
        const room: any = await redis.hgetall(roomId);
        if (room && room.adminSocketId === socket.id) {
            socket.join(roomId);
        }
    });

    // Admin reconnects after refresh (socket.id changes, so update Redis)
    socket.on("update_admin_socket", async ({ roomId }) => {
        const room: any = await redis.hgetall(roomId);
        if (room) {
            await redis.hset(roomId, { adminSocketId: socket.id });
            socket.join(roomId);
        }
    });

    // Regular user rejoins after refresh
    socket.on("rejoin_room", async ({ roomId }) => {
        const room: any = await redis.hgetall(roomId);
        if (room) {
            socket.join(roomId);
        } else {
            socket.emit("room_not_found");
        }
    });

    // Joiner requests access
    socket.on("request_join", async ({ roomId, userAlias }) => {
        const room: any = await redis.hgetall(roomId);
        if (room) {
            io.to(room.adminSocketId).emit("join_request", { socketId: socket.id, alias: userAlias });
        }
    });

    // Admin approves a join request
    socket.on("approve_user", ({ targetSocketId, roomId }) => {
        io.to(targetSocketId).emit("access_granted", { roomId });
        io.sockets.sockets.get(targetSocketId)?.join(roomId);
    });

    // Admin rejects a join request
    socket.on("reject_user", ({ targetSocketId }) => {
        io.to(targetSocketId).emit("frequency_denied");
    });

    // ── LAYER 3: Chat Logic ──
    socket.on("send_message", ({ roomId, message, isWhisper }) => {
        io.to(roomId).emit("new_message", { sender: socket.id, message, isWhisper });
        redis.hincrby(roomId, "heat", 1);
    });

    socket.on("typing", ({ roomId }) => {
        socket.to(roomId).emit("display_pulse_dot");
    });

    // ── LAYER 4: Nuclear / Snitch Protocol ──
    socket.on("snitch_detected", async ({ roomId }) => {
        const snitchIP = socket.handshake.address;
        await redis.set(`blacklist:${snitchIP}`, "true", { ex: 86400 });
        io.to(roomId).emit("GLOBAL_NUKE", { message: "SECURITY BREACH: ROOM DESTROYED" });
        await redis.del(roomId);
        io.in(roomId).socketsLeave(roomId);
    });

    // Admin exiles a user
    socket.on("exile_user", ({ targetSocketId, roomId }) => {
        io.to(targetSocketId).emit("exiled");
        io.sockets.sockets.get(targetSocketId)?.leave(roomId);
    });

    // Admin nukes the entire room
    socket.on("nuke_all", async (roomId) => {
        io.to(roomId).emit("ROOM_VANISHED");
        await redis.del(roomId);
        io.in(roomId).socketsLeave(roomId);
    });
};
