import { _decorator, Color, Component, instantiate, Label, Node, Prefab, Sprite } from 'cc';
import * as cc from 'cc';

import { logger } from './Clogger';
const { ccclass, property } = _decorator;

@ccclass('SceneMain')
export class SceneMain extends Component {

    @property(Node)
    node_fps:Node|null = null;

    @property(Node)
    node_counts:Node|null = null;

    @property(Prefab)
    prefab_item:Prefab|null = null;

    @property(Node)
    container_balls:Node|null = null;

    @property(cc.Node)
    node_switchscene:cc.Node|null = null;

    private _timeAccumulator: any;
    private _countAcc: any;

    private _listBalls: Node[] = [];

    protected onLoad(): void {
        logger.log('dballs onLoad');

        let p = cc.PhysicsSystem2D.instance;
        p.positionIterations = 4;
        p.velocityIterations = 2;
        
    }
    start() {
        logger.log('dballs start');

        // let n= this.node.getChildByName('ballitem')
        // let r =  n.getComponent(cc.CircleCollider2D).radius
        // logger.log('radius:', r);

        this.node_switchscene.on('click', (b:cc.Button) => {
            cc.director.loadScene('scene_rapier2d');
        });
    }

    update(dt: number) {
        if (!this._timeAccumulator) {
            this._timeAccumulator = 0;
        }
        this._timeAccumulator += dt;

        if (this._timeAccumulator >= 0.1) {
            this.node_fps.getComponent(Label)!.string = `FPS: ${Math.floor(1 / dt)}`;
            this._timeAccumulator = 0;
        }

        if(Math.floor(1 / dt) < 30){
            return;
        }

        if (!this._countAcc) {
            this._countAcc = 0;
        }        
        // this._countAcc += 1;
        //每秒实例化添加5个node_item 到场景中,并且显示当前场景中的node_item数量
        // if (this._countAcc >= 60/60) {
            for (let i = 0; i < 4; i++) {
                let node = instantiate(this.prefab_item);
                node.getComponent(Sprite).color = new Color(Math.random()*255, Math.random()*255, Math.random()*255);
                this.container_balls.addChild(node);
                let x  = (Math.random()*2-1)*cc.view.getVisibleSize().width/2;;
                node.setPosition(x, 400);
                this._listBalls.push(node);
            }
            this.node_counts.getComponent(Label)!.string = `BALLS: ${this._listBalls.length}`;
            this._countAcc = 0;
        // }


    }
}


