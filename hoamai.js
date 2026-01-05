const style = document.createElement('style');
style.innerHTML = `
    .card { position: relative !important; overflow: hidden !important; z-index: 1; }
    #flower-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
    .card > *:not(#flower-canvas) { position: relative; z-index: 2; }
`;
document.head.appendChild(style);

window.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    if (card) {
        const canvas = document.createElement('canvas');
        canvas.id = 'flower-canvas';
        card.prepend(canvas);
        const ctx = canvas.getContext('2d');
        let flowers = [];
        let obstacles = [];

        function updateObstacles() {
            obstacles = [];
            const elements = card.querySelectorAll('h2, label, input, button, .success-box, p, .nav-menu, span, img');
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const cardRect = card.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    obstacles.push({
                        left: rect.left - cardRect.left,
                        right: rect.right - cardRect.left,
                        top: rect.top - cardRect.top,
                        bottom: rect.bottom - cardRect.top,
                        id: Math.random()
                    });
                }
            });
        }

        function resize() {
            canvas.width = card.offsetWidth;
            canvas.height = card.offsetHeight;
            updateObstacles();
        }
        window.addEventListener('resize', resize);

        function drawFlower(x, y, size, rotation) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.fillStyle = "#FFD700"; 
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.ellipse(0, -size/2, size/1.5, size, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.rotate((72 * Math.PI) / 180);
            }
            ctx.beginPath(); 
            ctx.arc(0, 0, size/2.5, 0, Math.PI * 2);
            ctx.fillStyle = "#FF8C00"; 
            ctx.fill();
            ctx.restore();
        }

        class FallingFlower {
            constructor(isInstant) { 
                this.initialWait = isInstant ? 0 : Math.random() * 300; 
                this.reset(true, isInstant); 
            }
            
            reset(isFirstTime = false, isInstant = false) {
                this.x = Math.random() * canvas.width;
                
                if (isFirstTime && isInstant) {
                    // Nếu muốn xuất hiện ngay, cho hoa nằm rải rác sẵn trên màn hình
                    this.y = Math.random() * canvas.height;
                } else if (isFirstTime && !isInstant) {
                    // Những bông còn lại sẽ rơi từ từ sau đó
                    this.y = -Math.random() * canvas.height - 50;
                } else {
                    // Khi reset (rơi hết màn hình), luôn bắt đầu lại từ đỉnh
                    this.y = -30;
                }

                this.size = Math.random() * 3 + 4;
                this.speedY = Math.random() * 0.4 + 0.3;
                this.speedX = Math.random() * 0.2 - 0.1;
                this.rotation = Math.random() * 360;
                this.spin = Math.random() * 1 - 0.5;
                this.isRolling = false;
                this.rollDistance = 0;
                this.maxRoll = Math.random() * 20 + 15; 
                this.hasBouncedOn = null;
            }

            update() {
                if (this.initialWait > 0) { this.initialWait--; return; }

                let nextY = this.y + this.speedY;
                let nextX = this.x + this.speedX;
                let hitAny = false;

                if (this.rollDistance < this.maxRoll) {
                    obstacles.forEach(ob => {
                        if (nextX > ob.left && nextX < ob.right && 
                            (nextY + this.size) >= ob.top && (nextY + this.size) <= ob.top + 5 &&
                            this.hasBouncedOn !== ob.id) {
                            
                            hitAny = true;
                            if (!this.isRolling) {
                                this.speedY = -0.3;
                                this.speedX = Math.random() > 0.5 ? 0.6 : -0.6; 
                                this.isRolling = true;
                                this.hasBouncedOn = ob.id;
                            } else {
                                this.y = ob.top - this.size;
                                this.speedY = 0; 
                                this.rollDistance += Math.abs(this.speedX);
                            }
                        }
                    });
                }

                if (!hitAny || this.rollDistance >= this.maxRoll) {
                    if (this.isRolling) this.speedX *= 0.5; 
                    this.isRolling = false;
                    if (this.speedY < 0.7) this.speedY += 0.05; 
                    if (!hitAny) this.rollDistance = 0; 
                }

                this.y += this.speedY;
                this.x += this.speedX;
                this.rotation += this.spin;

                if (this.x < 5 || this.x > canvas.width - 5) this.speedX *= -1;
                if (this.y > canvas.height) this.reset();
            }

            draw() {
                if (this.initialWait > 0 || this.y < -this.size * 2) return;
                drawFlower(this.x, this.y, this.size, this.rotation);
            }
        }

        resize();
        // Tạo 10 bông hoa: 5 bông hiện ngay lập tức, 5 bông rơi dần sau
        for(let i=0; i<5; i++) { flowers.push(new FallingFlower(true)); }
        for(let i=0; i<5; i++) { flowers.push(new FallingFlower(false)); }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            flowers.forEach(f => { f.update(); f.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
        setInterval(updateObstacles, 3000); 
    }
});
