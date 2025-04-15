import { _decorator, Color, Component, instantiate, Label, Node, Prefab, Sprite } from 'cc';
import * as cc from 'cc';

import RAPIER, { IntegrationParameters } from '@dimforge/rapier2d-compat';
import { RAPIER_PTM_RATIO, RapierDebugRenderer } from './RapierDebugRenderer';
import { logger } from './Clogger';

const { ccclass, property } = _decorator;

@ccclass('SceneRapier2d')
export class SceneRapier2d extends Component {

    @property(Node)
    node_fps:Node|null = null;

    @property(Node)
    node_counts:Node|null = null;

    @property(Prefab)
    prefab_item:Prefab|null = null;

    @property(Node)
    container_balls:Node|null = null;

    @property(cc.Node)
    node_switch:cc.Node|null = null;


    private _timeAccumulator: any;
    private _countAcc: any;


    private world: RAPIER.World;
    private gravity = new RAPIER.Vector2(0, -10);
    private _initComplete: boolean = false;
    private _rigidBody: RAPIER.RigidBody;
    private _debugRenderer: RapierDebugRenderer;


    //将一个node和一个RigidBody绑定
    private _mapNodeBalls: Map<Node, RAPIER.RigidBody> = new Map<Node, RAPIER.RigidBody>();


    protected async onLoad(): Promise<void> {
        logger.log('dballs onLoad');

        RAPIER.init().then(() => {
            logger.log('RAPIER.init success');
            this._initComplete  = true;
            // 创建物理世界
            this.world = new RAPIER.World(this.gravity);
            this.fillWorld();
            this._debugRenderer = this.getComponent(RapierDebugRenderer)!;
            this._debugRenderer.setWorld(this.world);
        });
        
    }
    start() {
        logger.log('dballs start');


        this.node_switch.children[0]!.getComponent(Label).string = this._debugRenderer.onoff ? 'debug:ON' : 'debug:OFF';
        this.node_switch.on('click', (b:cc.Button) => {
            this._debugRenderer.onoff = !this._debugRenderer.onoff; 
            this._debugRenderer.clear();
            b!.node.children[0]!.getComponent(Label).string = this._debugRenderer.onoff ? 'debug:ON' : 'debug:OFF';
        });

        // this.schedule((dt:number)=>{
        //     if(!this._initComplete){
        //         return;
        //     }

        //     this.world.step();
            
        //     this._mapNodeBalls.forEach((rigidBody, node)=>{
        //         let position = rigidBody.translation();
        //         node.setPosition(position.x*RAPIER_PTM_RATIO, position.y*RAPIER_PTM_RATIO);
        //         node.active = true;
        //     });


        // }, 1/60, cc.macro.REPEAT_FOREVER, 0);

    }


    fillWorld(){
        let world = this.world;
        let viewSize = cc.view.getVisibleSize();
        let groundRigidBody = world.createRigidBody(new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Fixed));
        world.createCollider(RAPIER.ColliderDesc.cuboid(viewSize.width/2, 0.5).setTranslation(0,-viewSize.height/(2*RAPIER_PTM_RATIO)).setRestitution(1).setFriction(0.0), groundRigidBody);

        let groundRigidBody1 = world.createRigidBody(new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Fixed));
        world.createCollider(RAPIER.ColliderDesc.cuboid(0.5,viewSize.height/2 ).setTranslation(-viewSize.width/(2*RAPIER_PTM_RATIO),0).setRestitution(1).setFriction(0.0), groundRigidBody1);

        let groundRigidBody2 = world.createRigidBody(new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Fixed));
        world.createCollider(RAPIER.ColliderDesc.cuboid(0.5,viewSize.height/2 ).setTranslation(viewSize.width/(2*RAPIER_PTM_RATIO),0).setRestitution(1).setFriction(0.0), groundRigidBody2);

        // let rigidBody = world.createRigidBody(new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Dynamic).setTranslation(0.0, 5.0).setLinearDamping(0).setAngularDamping(0));
        // let collider = world.createCollider(RAPIER.ColliderDesc.ball(0.5).setDensity(1.0).setRestitution(1).setFriction(0.0), rigidBody);
        // this._rigidBody = rigidBody;
    }




    update(dt: number) {
        if (!this._timeAccumulator) {
            this._timeAccumulator = 0;
        }
        this._timeAccumulator += dt;

        // if (this._timeAccumulator >= 0.1) {
            this.node_fps.getComponent(Label)!.string = `FPS: ${Math.floor(1 / dt)}`;
            // this._timeAccumulator = 0;
        // }

        if(Math.floor(1 / dt) < 30){
            return;
        }

        if (!this._countAcc) {
            this._countAcc = 0;
        }        

        //物理系统同步
        if(!this._initComplete){
            return;
        }
        this.world.step();
        this._mapNodeBalls.forEach((rigidBody, node)=>{
            let position = rigidBody.translation();
            node.setPosition(position.x*RAPIER_PTM_RATIO, position.y*RAPIER_PTM_RATIO);
            node.active = true;
        });


        // this._countAcc += 1;
        // if (this._countAcc >= 60/60) {
            for (let i = 0; i < 4; i++) {
                let node = instantiate(this.prefab_item);
                node.getComponent(Sprite).color = new Color(Math.random()*255, Math.random()*255, Math.random()*255);
                node.active = false;
                this.container_balls.addChild(node);
                let x  = (Math.random()*2-1)*cc.view.getVisibleSize().width/2;
                let y = 400;

                let r = (node.getComponent(cc.UITransform).width-2)/2 ;
                let rigidBody = this.world.createRigidBody(new RAPIER.RigidBodyDesc(RAPIER.RigidBodyType.Dynamic).setTranslation(x/RAPIER_PTM_RATIO, y/RAPIER_PTM_RATIO).setLinearDamping(0).setAngularDamping(0).setCanSleep(false));
                this.world.createCollider(RAPIER.ColliderDesc.ball(r/RAPIER_PTM_RATIO).setDensity(1.0).setRestitution(0.5).setFriction(0.0), rigidBody);
                this._mapNodeBalls.set(node, rigidBody);
                // node.setPosition(x, 400);
                // this._listBalls.push(node);
                
            }
            this.node_counts.getComponent(Label)!.string = `BALLS: ${this.container_balls.children.length}`;
            // this._countAcc = 0;
        // }


    }
}


