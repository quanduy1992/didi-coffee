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
        let obstacles = []; // Danh sách các vật cản (chữ, ô nhập)

        function updateObstacles() {
            obstacles = [];
            // Lấy vị trí của Tiêu đề, các Input và Nút bấm
            const elements = card.querySelectorAll('h2, input, button, .success-box, p');
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const cardRect = card.getBoundingClientRect();
                obstacles.push({
                    left: rect.left - cardRect.left,
                    right: rect.right - cardRect.left,
                    top: rect.top - cardRect.top,
                    bottom: rect.bottom - cardRect.top
                });
            });
        }

        function resize() {
            canvas.width = card.offsetWidth;
            canvas.height = card.offsetHeight;
            updateObstacles();
        }
        window.addEventListener('resize', resize);
        resize();

        class Flower {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = -20;
                this.size = Math.random() * 5 + 3;
                this.speedY = Math.random() * 0.5 + 0.5; // Tốc độ rơi
                this.speedX = Math.random() * 0.4 - 0.2;
                this.rotation = Math.random() * 360;
                this.spin = Math.random() * 1 - 0.5;
                this.bounceCount = 0; // Giới hạn nảy để không bị kẹt
            }
            update() {
                let nextY = this.y + this.speedY;
                let nextX = this.x + this.speedX;

                // Kiểm tra va chạm với các vật cản (chữ, ô nhập)
                obstacles.forEach(ob => {
                    if (nextX > ob.left && nextX < ob.right && 
                        nextY > ob.top && nextY < ob.bottom && this.y <= ob.top) {
                        
                        this.speedY *= -0.4; // Nảy ngược lên (giảm lực)
                        nextY = ob.top - 2;   // Đẩy hoa lên trên vật cản 1 chút
                        this.speedX += (Math.random() - 0.5); // Văng ngang ngẫu nhiên
                    }
                });

                // Nếu đang nảy lên, sau đó trọng lực sẽ kéo xuống lại
                if (this.speedY < 0.3) this.speedY += 0.02; 

                this.y = nextY;
                this.x = nextX;
                this.rotation += this.spin;

                if (this.y > canvas.height) this.reset();
            }
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation * Math.PI / 180);
                ctx.fillStyle = "#FFD700"; 
                for (let i = 0; i < 5; i++) {
                    ctx.beginPath();
                    ctx.ellipse(0, -this.size, this.size/1.5, this.size, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.rotate((72 * Math.PI) / 180);
                }
                ctx.beginPath(); ctx.arc(0, 0, this.size/2.5, 0, Math.PI * 2);
                ctx.fillStyle = "#FF8C00"; ctx.fill();
                ctx.restore();
            }
        }

        for(let i=0; i<25; i++) { flowers.push(new Flower()); }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            flowers.forEach(f => { f.update(); f.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
        // Cập nhật lại vị trí vật cản sau khi trang ổn định
        setTimeout(updateObstacles, 1000); 
    }
});
