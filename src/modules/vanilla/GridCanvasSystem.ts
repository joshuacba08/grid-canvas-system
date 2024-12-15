class GridCanvasSystem {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  constructor(id: string, width?: number, height?: number) {
    this.canvas = document.getElementById(id) as HTMLCanvasElement;
    if (this.canvas === null) {
      throw new Error("Canvas element not found");
    }
    this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.canvas.width = width || 400;
    this.canvas.height = height || 400;
    this.canvas.style.backgroundColor = "#000000";
    this.drawGridSystem();
  }

  private drawGridSystem() {
    this.ctx.strokeStyle = "#00FF00";
    this.ctx.lineWidth = 0.25;
    this.ctx.fillStyle = "#009900";

    for (let x = 0; x < this.canvas.width; x += 10) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.lineWidth = x % 50 === 0 ? 0.5 : 0.25;
      this.ctx.stroke();
      if (x % 50 === 0) this.ctx.fillText(x.toString(), x, 10);
    }

    for (let y = 0; y < this.canvas.height; y += 10) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.lineWidth = y % 50 === 0 ? 0.5 : 0.25;
      this.ctx.stroke();
      if (y % 50 === 0) this.ctx.fillText(y.toString(), 0, y + 10);
    }
  }
  drawCoordinate(x: number, y: number) {
    this.ctx.fillStyle = "#00FF00";
    this.ctx.fillText(`(${x},${y})`, x, y);
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGridSystem();
  }
}

export default GridCanvasSystem;
