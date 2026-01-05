// Tự động thêm CSS vào trang để hoa rơi đúng trong khung card
const style = document.createElement('style');
style.innerHTML = `
    .card { position: relative !important; overflow: hidden !important; z-index: 1; }
    #flower-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; }
    .card > *:not(#flower-canvas) { position: relative; z-index: 2; }
`;
document.head.appendChild(style);

// Tạo thẻ Canvas và chèn vào trong thẻ .card
window.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    if (card) {
        const canvas = document.createElement('canvas');
        canvas.id = 'flower-canvas';
        card.prepend(canvas); // Đưa canvas lên đầu trong thẻ card

        const ctx = canvas.getContext('2d');
        let flowers = [];

        function resize() {
            canvas.width = card.offsetWidth;
            canvas.height = card.offsetHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        class Flower {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height - canvas.height;
                this.size = Math.random() * 6 + 4;
                this.speed = Math.random() * 0.5 + 0.5;
                this.velX = Math.random() * 1 - 0.5;
                this.rotation = Math.random() * 360;
                this.spin = Math.random() * 2 - 1;
            }
            update() {
                this.y += this.speed;
                this.x += this.velX;
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
                ctx.beginPath();
                ctx.arc(0, 0, this.size/2.5, 0, Math.PI * 2);
                ctx.fillStyle = "#FF8C00";
                ctx.fill();
                ctx.restore();
            }
        }

        for(let i=0; i<5; i++) { flowers.push(new Flower()); }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            flowers.forEach(f => { f.update(); f.draw(); });
            requestAnimationFrame(animate);
        }
        animate();
        setTimeout(resize, 300);
    }

});

