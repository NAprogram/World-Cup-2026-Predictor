import React, { useEffect, useRef, useState } from 'react';

const Pitch = ({ replayEvent }) => {
    const canvasRef = useRef(null);
    const PITCH_WIDTH = 120;
    const PITCH_HEIGHT = 80;
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!replayEvent) return;
        setProgress(0);
        
        let start;
        const duration = 2500; // 2.5 seconds
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const currentProgress = Math.min(elapsed / duration, 1);
            
            setProgress(currentProgress);
            
            if (currentProgress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }, [replayEvent]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const scaleX = width / PITCH_WIDTH;
        const scaleY = height / PITCH_HEIGHT;

        const drawPitch = () => {
            ctx.fillStyle = '#105c38';
            ctx.fillRect(0, 0, width, height);

            const bands = 12;
            const bandWidth = width / bands;
            ctx.fillStyle = '#0d4a2d';
            for (let i = 0; i < bands; i++) {
                if (i % 2 === 0) ctx.fillRect(i * bandWidth, 0, bandWidth, height);
            }

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, width, height);

            ctx.beginPath();
            ctx.moveTo(width / 2, 0);
            ctx.lineTo(width / 2, height);
            ctx.stroke();

            // Center circle
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, 9.15 * scaleX, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();

            // Penalty areas
            const penAreaDepth = 16.5 * scaleX;
            const penAreaWidth = 40.3 * scaleY;
            const penAreaY = (height - penAreaWidth) / 2;
            ctx.strokeRect(0, penAreaY, penAreaDepth, penAreaWidth);
            ctx.strokeRect(width - penAreaDepth, penAreaY, penAreaDepth, penAreaWidth);

            // Goal areas
            const goalAreaDepth = 5.5 * scaleX;
            const goalAreaWidth = 18.3 * scaleY;
            const goalAreaY = (height - goalAreaWidth) / 2;
            ctx.strokeRect(0, goalAreaY, goalAreaDepth, goalAreaWidth);
            ctx.strokeRect(width - goalAreaDepth, goalAreaY, goalAreaDepth, goalAreaWidth);

            // Penalty spots (11m from goal line)
            ctx.beginPath();
            ctx.arc(11 * scaleX, height / 2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(width - (11 * scaleX), height / 2, 2, 0, Math.PI * 2);
            ctx.fill();

            // Goals
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            const goalWidth = 7.32 * scaleY;
            const goalY = (height - goalWidth) / 2;
            ctx.fillRect(-2, goalY, 2, goalWidth);
            ctx.fillRect(width, goalY, 2, goalWidth);
        };

        const drawBlip = (x, y, color, label, alpha = 1) => {
            const cx = x * scaleX;
            const cy = y * scaleY;
            ctx.globalAlpha = alpha;

            ctx.beginPath();
            ctx.arc(cx, cy, 15, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha * 0.2;
            ctx.fill();
            
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();

            if (label) {
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(label, cx, cy - 12);
            }
            ctx.globalAlpha = 1.0;
        };

        const getBezierXY = (t, sx, sy, cp1x, cp1y, ex, ey) => {
            const ix = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cp1x + t * t * ex;
            const iy = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cp1y + t * t * ey;
            return { x: ix, y: iy };
        };

        const drawAnimatedCurve = (startX, startY, endX, endY, color, isDashed, animProgress, isHighArc = false) => {
            if (animProgress <= 0) return;
            
            const sx = startX * scaleX;
            const sy = startY * scaleY;
            const ex = endX * scaleX;
            const ey = endY * scaleY;

            // Control point height determines the arc
            const arcHeight = isHighArc ? 80 : 40;
            const cp1x = sx + (ex - sx) / 2;
            const cp1y = sy - arcHeight;

            ctx.beginPath();
            ctx.moveTo(sx, sy);

            for (let t = 0; t <= animProgress; t += 0.02) {
                const pt = getBezierXY(t, sx, sy, cp1x, cp1y, ex, ey);
                ctx.lineTo(pt.x, pt.y);
            }

            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            if (isDashed) ctx.setLineDash([5, 5]);
            else ctx.setLineDash([]);
            
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            ctx.stroke();
            
            ctx.shadowBlur = 0;
            ctx.setLineDash([]);
        };

        // Render Frame
        drawPitch();

        if (replayEvent) {
            
            if (replayEvent.goal_type === 'penalty') {
                // PENALTY KICK PHYSICS
                // Entire 2.5s is devoted to the shot curve
                drawBlip(replayEvent.mid_pos.x, replayEvent.mid_pos.y, '#f59e0b', replayEvent.scorer, 1);
                drawAnimatedCurve(replayEvent.mid_pos.x, replayEvent.mid_pos.y, replayEvent.end_pos.x, replayEvent.end_pos.y, '#f59e0b', false, progress);
                
                if (progress >= 1) {
                    const gx = replayEvent.end_pos.x * scaleX;
                    const gy = replayEvent.end_pos.y * scaleY;
                    ctx.beginPath();
                    ctx.arc(gx, gy, 12, 0, Math.PI * 2);
                    ctx.fillStyle = '#fbbf24';
                    ctx.fill();
                    ctx.shadowColor = '#fbbf24';
                    ctx.shadowBlur = 30;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }

            } else {
                // OPEN PLAY OR CORNER KICK PHYSICS
                // 50% time for pass, 50% for shot
                const passProgress = Math.min(progress * 2, 1);
                const shotProgress = Math.max((progress - 0.5) * 2, 0);
                const isCorner = replayEvent.goal_type === 'corner';
                const passColor = isCorner ? '#10b981' : '#0ea5e9'; // Emerald for Corner, Cyan for Open Play
                
                if (replayEvent.assister) {
                    drawBlip(replayEvent.start_pos.x, replayEvent.start_pos.y, passColor, replayEvent.assister, 1);
                    // Corners use a higher arc
                    drawAnimatedCurve(replayEvent.start_pos.x, replayEvent.start_pos.y, replayEvent.mid_pos.x, replayEvent.mid_pos.y, passColor, true, passProgress, isCorner);
                }

                if (!replayEvent.assister || passProgress >= 1) {
                    const actualShotProgress = replayEvent.assister ? shotProgress : progress;
                    drawBlip(replayEvent.mid_pos.x, replayEvent.mid_pos.y, '#ef4444', replayEvent.scorer, 1);
                    drawAnimatedCurve(replayEvent.mid_pos.x, replayEvent.mid_pos.y, replayEvent.end_pos.x, replayEvent.end_pos.y, '#ef4444', false, actualShotProgress);
                    
                    if (actualShotProgress >= 1) {
                        const gx = replayEvent.end_pos.x * scaleX;
                        const gy = replayEvent.end_pos.y * scaleY;
                        ctx.beginPath();
                        ctx.arc(gx, gy, 12, 0, Math.PI * 2);
                        ctx.fillStyle = '#fbbf24';
                        ctx.fill();
                        ctx.shadowColor = '#fbbf24';
                        ctx.shadowBlur = 30;
                        ctx.stroke();
                        ctx.shadowBlur = 0;
                    }
                }
            }
        } else {
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.font = 'bold 20px monospace';
            ctx.textAlign = 'center';
            ctx.fillText("SELECT 'REPLAY GOAL' IN TIMELINE", width / 2, height / 2);
        }

    }, [replayEvent, progress]);

    return (
        <canvas 
            ref={canvasRef} 
            width={800} 
            height={533} 
            className="w-full h-auto bg-slate-900 border border-slate-700 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-lg"
        />
    );
};

export default Pitch;
