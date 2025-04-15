import { _decorator, Component, Graphics, Color } from 'cc';
const { ccclass, property } = _decorator;

// import RAPIER from '@dimforge/rapier2d';

export const RAPIER_PTM_RATIO:number = 32.0;

@ccclass('RapierDebugRenderer')
export class RapierDebugRenderer extends Component {
    @property(Graphics)
    graphics: Graphics = null!;

    // 可选：可调整的线宽
    @property
    lineWidth: number = 1.0;

    // 可选：坐标缩放系数
    @property
    scale: number = RAPIER_PTM_RATIO;

    @property
    onoff: boolean = false;


    private _world: any = null; // RAPIER.World 类型

    /**
     * 设置物理世界引用
     * @param world RAPIER物理世界实例
     */
    public setWorld(world: any) {
        this._world = world;
    }

    /**
     * 在每帧更新中调用以渲染调试图形
     */
    update() {
        if (!this._world || !this.graphics) return;
        
        this.onoff && this.render(this._world);
    }

    clear(){
        this.graphics&&this.graphics.clear();
    }

    /**
     * 渲染物理世界的调试信息
     * @param world RAPIER物理世界
     */
    render(world: any) {
        // 获取调试渲染数据
        const { vertices, colors } = world.debugRender();
        
        // 清除之前的绘制内容
        this.graphics.clear();

        // const g = this.graphics;
        // g.lineWidth = 10;
        // g.fillColor.fromHEX('#ff0000ff');
        // g.moveTo(-40, 0);
        // g.lineTo(0, -80);
        // g.lineTo(40, 0);
        // g.lineTo(0, 80);
        // g.close();
        // g.stroke();
        // g.fill();

        // 遍历所有线段进行绘制
        for (let i = 0; i < vertices.length / 4; i++) {
            // 从颜色数组中获取当前线段的颜色
            const r = Math.floor(colors[i * 8] * 255);     // 转换为 0-255 范围
            const g = Math.floor(colors[i * 8 + 1] * 255);
            const b = Math.floor(colors[i * 8 + 2] * 255);
            const a = colors[i * 8 + 3] * 255;             // alpha 直接使用 0-255 范围
            
            // 设置线条样式
            this.graphics.lineWidth = this.lineWidth;
            this.graphics.strokeColor = new Color(r, g, b, a);
            
            // 获取线段的起点和终点坐标
            // 注意：Cocos Creator 使用左下角为原点的坐标系，y轴向上为正
            // 而 RAPIER 可能使用不同的坐标系，因此这里做适当调整
            
            // 获取原始坐标
            let x1 = vertices[i * 4] * this.scale;
            let y1 = vertices[i * 4 + 1] * this.scale;
            let x2 = vertices[i * 4 + 2] * this.scale;
            let y2 = vertices[i * 4 + 3] * this.scale;
            
            
            // 执行绘制
            this.graphics.moveTo(x1, y1);
            this.graphics.lineTo(x2, y2);
            this.graphics.close();
            this.graphics.stroke();
        }
    }
}