// Canvas Clock Widget
function initClock(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
  
    function drawClock() {
      const now = new Date();
      const w = canvas.width;
      const h = canvas.height;
      const radius = Math.min(w, h) / 2 * 0.85;
      const cx = w / 2;
      const cy = h / 2;
  
      ctx.clearRect(0, 0, w, h);
  
      // Outer glow ring
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.05);
      grad.addColorStop(0, 'rgba(0,200,255,0.15)');
      grad.addColorStop(1, 'rgba(0,200,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.05, 0, 2 * Math.PI);
      ctx.fillStyle = grad;
      ctx.fill();
  
      // Clock face
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(10, 15, 30, 0.85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
  
      // Hour markers
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI * 2) / 12 - Math.PI / 2;
        const isQuarter = i % 3 === 0;
        const inner = isQuarter ? radius * 0.72 : radius * 0.82;
        const outer = radius * 0.92;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
        ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
        ctx.strokeStyle = isQuarter ? 'rgba(0,200,255,0.9)' : 'rgba(0,200,255,0.4)';
        ctx.lineWidth = isQuarter ? 2.5 : 1;
        ctx.stroke();
      }
  
      // Hands
      const hr = now.getHours() % 12;
      const min = now.getMinutes();
      const sec = now.getSeconds();
  
      function drawHand(angle, length, width, color) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, -length);
        ctx.lineTo(0, length * 0.15);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.restore();
      }
  
      const hourAngle = ((hr + min / 60) / 12) * Math.PI * 2 - Math.PI / 2;
      const minAngle = ((min + sec / 60) / 60) * Math.PI * 2 - Math.PI / 2;
      const secAngle = (sec / 60) * Math.PI * 2 - Math.PI / 2;
  
      drawHand(hourAngle, radius * 0.5, 4, 'rgba(255,255,255,0.9)');
      drawHand(minAngle, radius * 0.7, 2.5, 'rgba(0,200,255,0.95)');
      drawHand(secAngle, radius * 0.8, 1.5, 'rgba(255, 80, 80, 1)');
  
      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 200, 255, 1)';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0,200,255,1)';
      ctx.fill();
  
      // Digital time below
      ctx.shadowBlur = 0;
      ctx.font = `bold ${Math.floor(radius * 0.22)}px 'Share Tech Mono', monospace`;
      ctx.fillStyle = 'rgba(0,200,255,0.9)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const hStr = String(now.getHours()).padStart(2, '0');
      const mStr = String(min).padStart(2, '0');
      const sStr = String(sec).padStart(2, '0');
      ctx.fillText(`${hStr}:${mStr}:${sStr}`, cx, cy + radius * 0.62);
    }
  
    drawClock();
    setInterval(drawClock, 1000);
  } 
  