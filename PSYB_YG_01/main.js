var SCREEN_WIDTH    = 680;              // スクリーン幅
var SCREEN_HEIGHT   = 960;              // スクリーン高さ
var SCREEN_CENTER_X = SCREEN_WIDTH/2;   // スクリーン幅の半分
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;  // スクリーン高さの半分
var FONT_FAMILY     = "'Press Start 2P','Meiryo',sans-serif";
var ASSETS = {
    "player":  "./angus_128.png",
    "anthrax_128":  "./anthrax_128.png",
    "IronMaiden_128":  "./IronMaiden_128.png",
    "sod_128":  "./sod_128.png",
    "dri_128":  "./dri_128.png",
    "Motorhead_128":  "./motorhead_128.png",
    "metallica_128":  "./metallica_128.png",
    "bg_gra":  "./bg_gra.png",
    "bg_sky":  "./bg_sky.png",
    "bg_floor":"./bg_floor.png",
    "fallSE":  "./fall.mp3",
};

var bgFloorX = 450;
var bgSkyX = 450;
var player = null;

tm.main(function() {
    // アプリケーションクラスを生成
    var app = tm.display.CanvasApp("#world");
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);    // サイズ(解像度)設定
    app.fitWindow();                            // 自動フィッティング有効
    app.background = "rgba(77, 136, 255, 1.0)"; // 背景色
    app.fps = 30;                               // フレーム数
 
    var loading = tm.ui.LoadingScene({
        assets: ASSETS,
        width:  SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    });

    // 読み込み完了後に呼ばれるメソッドを登録
    loading.onload = function() {
        app.replaceScene(LogoScene());
    };

    // ローディングシーンに入れ替える
    app.replaceScene(loading);

    // 実行
    app.run();
});

/*
 * ロゴ
 */
tm.define("LogoScene", {
    superClass: "tm.app.Scene",

    init: function() {
        this.superInit();
        this.fromJSON({
            children: [
                {
                    type: "Label", name: "logoLabel",
                    x: SCREEN_CENTER_X,
                    y: 320,
                    fillStyle: "#888",
                    fontSize: 64,
                    fontFamily: FONT_FAMILY,
                    text: "LOGO",
                    align: "center",
                },
            ]
        });
        this.localTimer = 0;
    },

    update: function(app) {
        // 時間が来たらタイトルへ
//        if(++this.localTimer >= 5*app.fps){
            this.app.replaceScene(TitleScene());
//        }
    }
});

/*
 * タイトル
 */
tm.define("TitleScene", {
    superClass: "tm.app.Scene",

    init: function() {
        this.superInit();
        this.fromJSON({
            children: [
                {
                    type: "Label", name: "titleLabel",
                    x: SCREEN_CENTER_X,
                    y: 320,
                    fillStyle: "#fff",
                    fontSize: 64,
                    fontFamily: FONT_FAMILY,
                    text: "PSYB_YG\n01.3",
                    align: "center",
                },
                {   
                    type: "FlatButton", name: "startButton",
                    init: [
                        {
                            text: "START",
                            fontFamily: FONT_FAMILY,
                            fontSize: 32,
                            bgColor: "hsl(240, 0%, 70%)",
                        }
                    ],
                    x: SCREEN_CENTER_X,
                    y: 650,
                },
            ]
        });

        this.localTimer = 0;

        var self = this;
        this.startButton.onpointingstart = function() {
            self.app.replaceScene(GameScene());
        };
    },

    update: function(app) {
        app.background = "rgba(0, 0, 0, 1.0)"; // 背景色
        // 時間が来たらデモへ
//        if(++this.localTimer >= 5*app.fps){
//            this.app.replaceScene(DemoScene());
//        }
    }
});

/*
 * デモ
 */
tm.define("DemoScene", {
    superClass: "tm.app.Scene",

    init: function() {
        this.superInit();
        this.fromJSON({
            children: [
                {
                    type: "Label", name: "demoLabel",
                    x: SCREEN_CENTER_X,
                    y: 320,
                    fillStyle: "#888",
                    fontSize: 64,
                    fontFamily: FONT_FAMILY,
                    text: "DEMO",
                    align: "center",
                },
            ]
        });
        this.localTimer = 0;
    },

    update: function(app) {
        // 時間が来たらタイトルへ
        if(++this.localTimer >= 5*app.fps){
            this.app.replaceScene(TitleScene());
        }

        // タッチしたらタイトルへ
        var pointing = app.pointing;
        // タッチしているかを判定
        if (pointing.getPointing()) {
            this.app.replaceScene(TitleScene());
        }
    }
});

/*
 * ゲーム
 */
tm.define("GameScene", {
    superClass: "tm.app.Scene",
    
    init: function() {
        this.superInit();
        this.bgGradation = tm.display.Sprite("bg_gra").addChildTo(this);
        this.bgGradation.setPosition(SCREEN_CENTER_X, SCREEN_CENTER_Y);

        this.bgFloor0 = tm.display.Sprite("bg_floor").addChildTo(this);
        this.bgFloor0.setPosition(bgFloorX, 900);
        this.bgFloor1 = tm.display.Sprite("bg_floor").addChildTo(this);
        this.bgFloor1.setPosition(bgFloorX+900, 900);

        this.bgSky0 = tm.display.Sprite("bg_sky").addChildTo(this);
        this.bgSky0.setPosition(bgSkyX, 300);
        this.bgSky1 = tm.display.Sprite("bg_sky").addChildTo(this);
        this.bgSky1.setPosition(bgSkyX+900, 300);

	    player = new Player().addChildTo(this);

        this.fromJSON({
            children: [
                {
                    type: "Label", name: "nowScoreLabel",
                    x: SCREEN_CENTER_X,
                    y: SCREEN_HEIGHT-24,
                    fillStyle: "#fff",
                    shadowColor: "#000",
                    shadowBlur: 10,
                    fontSize: 32,
                    fontFamily: FONT_FAMILY,
                    text: "0",
                    align: "center",
                },
                {
                    type: "Label", name: "introLabel",
                    x: SCREEN_CENTER_X,
                    y: SCREEN_CENTER_Y+80,
                    fillStyle: "#fff",
                    shadowColor: "#000",
                    shadowBlur: 10,
                    fontSize: 32,
                    fontFamily: FONT_FAMILY,
                    text: "TAP TO START",
                    align: "center",
                },
            ]
        });

        this.buttonAlpha = 0.0;

        this.score = 0;
        this.frame = 0;
        this.enemyCount = 0;
        this.stopBGM = false;
    },

    onpointingstart: function() {
        if(player.isDead){
            return;
        }
        if(!player.isStart){
            this.introLabel.remove();
        }
        player.vec.y = -20;
	    player.isStart = true;
    },

    update: function(app) {
//        app.background = "rgba(77, 136, 255, 1.0)"; // 背景色
        if(!player.isDead){
            bgFloorX -= 3;
            if(bgFloorX < -450){
                bgFloorX = 450;
            }
            this.bgFloor0.setPosition(bgFloorX, 900);
            this.bgFloor1.setPosition(bgFloorX+900, 900);

            bgSkyX -= 1;
            if(bgSkyX < -450){
                bgSkyX = 450;
            }
            this.bgSky0.setPosition(bgSkyX, 300);
            this.bgSky1.setPosition(bgSkyX+900, 300);

            if(player.isStart){
                this.score++;
                this.frame++;
                this.tmpSec = Math.floor(this.frame/app.fps);
                if(this.tmpSec > 170){
                    this.frame = 0;
                }
                if(this.frame % 60 == 0){
                    this.enemyNum = -1;
                    // 敵発生数の決定
                    if(this.tmpSec < 60){
                        this.enemyNum = 1;
                    }else if(this.tmpSec < 120){
                        this.enemyNum = 2;
                    }else if(this.tmpSec < 2147483647){
                        if(tm.util.Random.randint(1, 10) <= 1){
                            this.enemyNum = 3;
                        }else if(tm.util.Random.randint(1, 3) <= 2){
                            this.enemyNum = 2;
                        }else{
                            this.enemyNum = 1;
                        }
                    }

                    (this.enemyNum).times(function() {
                        // 敵種別の決定
                        this.enemyKind = -1;
                        if(this.tmpSec < 10){
                            this.enemyKind = 0;
                        }else if(this.tmpSec < 20){
                            this.enemyKind = 1;
                        }else if(this.tmpSec < 30){
                            this.enemyKind = 2;
                        }else if(this.tmpSec < 40){
                            this.enemyKind = 3;
                        }else if(this.tmpSec < 50){
                            this.enemyKind = 4;
                        }else if(this.tmpSec < 60){
                            this.enemyKind = 5;
                        }else if(this.tmpSec < 70){
                            this.enemyKind = 0;
                        }else if(this.tmpSec < 80){
                            this.enemyKind = 1;
                        }else if(this.tmpSec < 90){
                            this.enemyKind = 2;
                        }else if(this.tmpSec < 100){
                            this.enemyKind = 3;
                        }else if(this.tmpSec < 110){
                            this.enemyKind = 4;
                        }else if(this.tmpSec < 120){
                            this.enemyKind = 5;
                        }else if(this.tmpSec < 130){
                            this.enemyKind = tm.util.Random.randint(0, 1);
                        }else if(this.tmpSec < 140){
                            this.enemyKind = tm.util.Random.randint(0, 2);
                        }else if(this.tmpSec < 150){
                            this.enemyKind = tm.util.Random.randint(0, 3);
                        }else if(this.tmpSec < 160){
                            this.enemyKind = tm.util.Random.randint(0, 4);
                        }else if(this.tmpSec < 2100000000){
                            this.enemyKind = tm.util.Random.randint(0, 5);
                        }

                        var enemy = Enemy(this.enemyKind);
                        enemy.x = SCREEN_WIDTH+64;
                        if(this.enemyCount%3 == 0){
                            enemy.y = tm.util.Random.randint(0+64, player.y);
                        }else{
                            enemy.y = tm.util.Random.randint(0+64, SCREEN_HEIGHT-120-64);
                        }
                        enemy.yOfs = enemy.y;
                        this.addChild(enemy);
                    }, this);
                    this.enemyCount++;
                }
            }
            this.nowScoreLabel.text = Math.floor(this.score/app.fps);
        }else{
            if(!this.stopBGM){
	            tm.asset.AssetManager.get("fallSE").clone().play();
                this.stopBGM = true;

                this.fromJSON({
                    children: [
                         {
                             type: "Label", name: "resultScoreLabel",
                             x: SCREEN_CENTER_X,
                             y: 320,
                             fillStyle: "#fff",
                             shadowColor: "#000",
                             shadowBlur: 10,
                             fontSize: 64,
                             fontFamily: FONT_FAMILY,
                             text: "0",
                             align: "center",
                         },
                         {
                             type: "FlatButton", name: "tweetButton",
                             init: [
                                 {
                                     text: "TWEET",
                                     fontFamily: FONT_FAMILY,
                                     fontSize: 32,
                                     bgColor: "hsl(240, 80%, 70%)",
                                 }
                             ],
                             x: SCREEN_CENTER_X-160,
                             y: 650,
                             alpha: 0.0,
                         },
                         {
                             type: "FlatButton", name: "restartButton",
                             init: [
                                 {
                                     text: "RESTART",
                                     fontFamily: FONT_FAMILY,
                                     fontSize: 32,
                                     bgColor: "hsl(240, 0%, 70%)",
                                 }
                             ],
                             x: SCREEN_CENTER_X+160,
                             y: 650,
                             alpha: 0.0,
                         },
                    ]
                });
                this.tweetButton.sleep();
                this.restartButton.sleep();
                
                var self = this;
                // tweet ボタン
                this.tweetButton.onclick = function() {
                    var twitterURL = tm.social.Twitter.createURL({
                        type    : "tweet",
                        text    : "PSYB_YG_01_3 スコア: "+self.resultScoreLabel.text,
                        hashtags: "細胞彼女",
                        url     : "https://iwasaku.github.io/test/PSYB_YG_01/index.html",
                    });
                    window.open(twitterURL);
                };

                // back ボタン
                this.restartButton.onpointingstart = function() {
                    self.app.replaceScene(GameScene());
                };

                this.resultScoreLabel.text = this.nowScoreLabel.text;
                this.nowScoreLabel.remove();
            }
            this.buttonAlpha += 0.05;
            if(this.buttonAlpha > 1.0){
                this.buttonAlpha = 1.0;
            }
            this.tweetButton.setAlpha(this.buttonAlpha);
            this.restartButton.setAlpha(this.buttonAlpha);
	        if(this.buttonAlpha > 0.7){
                this.tweetButton.wakeUp();
                this.restartButton.wakeUp();
            }
        }
    }
});

/*
 * Player
 */
tm.define("Player", {
    superClass: "tm.app.Sprite",
 
    init: function () {
        this.superInit("player", 128, 128);
        this.direct = '';
        this.vec = tm.geom.Vector2(0, 0);
        this.zRot = 0;
        this.setPosition(200, SCREEN_CENTER_Y).setScale(1, 1);
        this.setInteractive(false);
        this.setBoundingType("circle");
        this.radius = 48;

	    this.isStart = false;
	    this.isDead = false;
    },


    update: function(app) {
        if(!this.isStart){
            return;
        }
        this.position.add(this.vec);
        if(this.y > SCREEN_HEIGHT-120){
            this.isDead = true;
            this.y = SCREEN_HEIGHT-120;
            return;
        }

        if(this.y < 32){
            this.y = 32;
        }

        if(this.vec.y < 0){
            this.zRot = -16;
        }
        if(this.vec.y > 0){
            this.zRot += 2;
            if(this.zRot > 35){
                this.zRot = 35;
            }
        }
        this.rotation = this.zRot;

        this.vec.y += 2;
        if(this.vec.y >= 30){
            this.vec.y = 30;
        }

    },
});

/*
 * Enemey
 */
tm.define("Enemy", {
    superClass: "tm.app.Sprite",
 
    init: function(kind) {
        this.spriteName = "";
        switch (kind){
            case 0:
                this.spriteName = "sod_128";
                break;
            case 1:
                this.spriteName = "anthrax_128";
                break;
            case 2:
                this.spriteName = "IronMaiden_128";
                break;
            case 3:
                this.spriteName = "dri_128";
                break;
            case 4:
                this.spriteName = "Motorhead_128";
                break;
            case 5:
                this.spriteName = "metallica_128";
                break;
        }
        this.superInit(this.spriteName, 128, 128);
        this.direct = '';
        this.setInteractive(false);
        this.setBoundingType("circle");
        this.radius = 48;
 
        this.speedOfs = tm.util.Random.randint(4, 10);
        this.sinOfs = Math.random() * 20;
        this.kind = kind;
        this.vec = tm.geom.Vector2(0, 0);
        this.position.set(0, 0);
        this.yOfs = 0;
        if(tm.util.Random.randint(0, 1) == 0){
            this.yDir = 1;
        }else{
            this.yDir = -1;
        }
        this.counter = 0;
    },

    update: function(app) {
        if(player.isDead){
            return;
        }
        switch(this.kind){
            case 0:
                this.vec.x = -this.speedOfs;
                this.position.add(this.vec);
                break;
            case 1:
                this.vec.x = -this.speedOfs;
                this.position.add(this.vec);
                this.y = (50.0+this.sinOfs)*Math.sin(this.x/100.0)+this.yOfs;
                break;
            case 2:
                this.vec.x = -this.speedOfs+((++this.counter%19)-9);
                this.position.add(this.vec);
                break;
            case 3:
                this.vec.x = -this.speedOfs;
                this.vec.y = -this.speedOfs*this.yDir;
                this.position.add(this.vec);
                break;
            case 4:
                this.vec.x = -this.speedOfs;
                this.position.add(this.vec);
                if(++this.counter > 40)this.counter=0;
                {
                    var tmpX = (this.counter-20)/20.0;
                    var tmpY = -this.yDir*(tmpX*tmpX)+this.yDir;
                    if(this.yDir == -1) this.y = SCREEN_HEIGHT-128;
                    else               this.y = 64;
                    this.y += tmpY*(100+this.sinOfs*20.0);
                }
                break;
            case 5:
                this.vec.x = -this.speedOfs;
                this.counter -= this.speedOfs;
                this.position.add(this.vec);
                this.x += (this.sinOfs/4.0+5.0)*Math.cos((this.counter+3.14/2)/50.0);
                this.y += (this.sinOfs/4.0+5.0)*Math.sin(this.counter/50.0);
                break;
        }

        if(this.y > SCREEN_HEIGHT-120){
            this.y = SCREEN_HEIGHT-120;
            this.yDir = 1;
        }else if(this.y < 32){
            this.y = 32;
            this.yDir = -1;
        }
        if(this.x < -64){              // 画面左端から出た?
	        this.remove();
        }
        if(this.isHitElement(player)){ // 自機と衝突している
            player.isDead = true;
            this.remove(); // 削除
        }
    },
});
