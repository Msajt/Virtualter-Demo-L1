//! VARIÁVEIS DO VÍDEO
var video;
var poseNet;
var pose;

//! VARIÁVEIS DA POSE
var posicaoInicialX, posicaoInicialY;
var limiteMaxY, limiteMinY;

//! VARIÁVEL DO BOTÃO DE CALIBRAR
var calibrar;

//! VARIÁVEL PARA O UNITY
var gameInstance = UnityLoader.instantiate("gameContainer", "Build/Build Versions.json", {onProgress: UnityProgress});

//! LIGAR VIDEO
var videoLigado = false;

//! VÁRIAVEL QUADRADOS
var leftSquare = [];
var rightSquare = [];

//! VARIÁVEL MÃOS
var leftHand;
var rightHand;

function setup(){
  let cnv = createCanvas(480, 360);
  cnv.position(0, 125);

  setTimeout(CarregarVideo, 20000);

  calibrar = createButton("RECALIBRAR");
  calibrar.position(540, 20);
  calibrar.mousePressed(Recalibrar);

  for(let i=0; i<5; i++){
    leftSquare[i] = createSprite(75, 70*(i+1)-20, 30, 30);
    rightSquare[i] = createSprite(480-75, 70*(i+1)-20, 30, 30);
  }

  leftHand = createSprite(10, 10, 10, 10);
  rightHand = createSprite(10, 10, 10, 10);
}

function draw(){

  if(videoLigado){
    //image(video, 0, 0);
    
    push();
    translate(video.width, 0);
    scale(-1, 1);
    image(video, -1,1);
    pop();
    
    fill(255, 0, 0);

    if(pose){

      //* EXIBE A LINHA QUE DEMARCA O LIMITE ENTRE CIMA/BAIXO
      line(0, limiteMaxY, width, limiteMaxY);

      //* EXIBE UM PONTO A PARTIR DO CENTRO DO QUADRIL DO USUÁRIO
      ellipse((pose.leftHip.x+pose.rightHip.x)/2, (pose.leftHip.y+pose.rightHip.y)/2, 8);

      //* BREVE VERIFICAÇÃO DA POSIÇÃO DO QUADRIL PARA DEFINIR SE USUÁRIO SUBIU OU DESCEU
        fill(255);
        textSize(25);
      if( ((pose.leftHip.y+pose.rightHip.y)/2) > limiteMaxY){
        gameInstance.SendMessage('Player', 'PlayerStep', 'down');
        text('baixo', 550, 60);
      } else{
        gameInstance.SendMessage('Player', 'PlayerStep', 'up');
        text('cima', 550, 60);
      }

      // <<
      leftHand.position.x = 480-pose.rightWrist.x;
      leftHand.position.y = pose.rightWrist.y;
      // >>
      rightHand.position.x = 480-pose.leftWrist.x;
      rightHand.position.y = pose.leftWrist.y;
      
      for(let i=0; i<5; i++){
        // >>
        if(leftHand.overlap(rightSquare[i])){
          gameInstance.SendMessage("Player", "PlayerInclination", "R" + (i+1));
          //console.log("DIREITA: " + i);
        }
        // <<
        else if(rightHand.overlap(leftSquare[i])){
          gameInstance.SendMessage("Player", "PlayerInclination", "L" + (i+1));
          //console.log("ESQUERDA: " + i);
        }
      }
      /*
      for(let j=1; j<3; j++){
        if(leftHand.overlap(rightSquare[j*2])){
          gameInstance.SendMessage("Player", "PlayerHands_Javascript", "R" + (j));
        }
        else if(rightHand.overlap(leftSquare[j*2])){
          gameInstance.SendMessage("Player", "PlayerHands_Javascript", "L" + (j));
        }
      }
      */
      if(leftHand.overlap(rightSquare[1])) gameInstance.SendMessage("Player", "PlayerHands_Javascript", "R2");
      if(leftHand.overlap(rightSquare[3])) gameInstance.SendMessage("Player", "PlayerHands_Javascript", "R1");
      if(rightHand.overlap(leftSquare[1])) gameInstance.SendMessage("Player", "PlayerHands_Javascript", "L2");
      if(rightHand.overlap(leftSquare[3])) gameInstance.SendMessage("Player", "PlayerHands_Javascript", "L1");
/*
        if(leftHand.overlap(rightSquare[3])){
          gameInstance.SendMessage("Player", "PlayerHands_Javascript", "R" + (1));
        }
        else if(leftHand.overlap(rightSquare[1])){
          gameInstance.SendMessage("Player", "PlayerHands_Javascript", "R" + (2));
        }

        else if(rightHand.overlap(leftSquare[3])){
          gameInstance.SendMessage("Player", "PlayerHands_Javascript", "L" + (1));
        }

        else if(rightHand.overlap(leftSquare[1])){
          gameInstance.SendMessage("Player", "PlayerHands_Javascript", "L" + (2));
        }
      */
      
    }

    drawSprites();
    /*
    fill(255, 0, 0);

    if(pose){
    //* EXIBE A LINHA QUE DEMARCA O LIMITE ENTRE CIMA/BAIXO
    line(0, limiteMaxY, width, limiteMaxY);

    //* EXIBE UM PONTO A PARTIR DO CENTRO DO QUADRIL DO USUÁRIO
    ellipse((pose.leftHip.x+pose.rightHip.x)/2, (pose.leftHip.y+pose.rightHip.y)/2, 8);

    //* BREVE VERIFICAÇÃO DA POSIÇÃO DO QUADRIL PARA DEFINIR SE USUÁRIO SUBIU OU DESCEU
      fill(255);
      textSize(25);
    if( ((pose.leftHip.y+pose.rightHip.y)/2) > limiteMaxY){
      gameInstance.SendMessage('Player', 'PlayerStep', 'down');
      text('baixo', 550, 60);
    } else{
      gameInstance.SendMessage('Player', 'PlayerStep', 'up');
      text('cima', 550, 60);
    }
  }
    */
  }

}

function CarregarVideo(){
    //? CARREGAR WEBCAM
    video = createCapture(VIDEO);
    video.size(480,360);
    video.hide();
  
    //? CARREGAR POSENET
    poseNet = ml5.poseNet(video, { inputResolution: 289 }, modelReady);
    poseNet.on('pose', gotPoses);

    videoLigado = true;
}

//! COLETA DAS POSES DO USUÁRIO
function gotPoses(poses) {
  // console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
    //console.log(pose);
  }
}

//! VERIFICA SE O MODELO DE VERIFICAÇÃO DAS POSES FUNCIONOU
function modelReady() {
  console.log('model ready');
  Recalibrar();
}

//! FUNÇÃO PARA CALIBRAR A POSIÇÃO DO USUÁRIO SEM A NECESSIDADE DE ATUALIZAR A PÁGINA
function Recalibrar(){
  setTimeout(()=>{
    posicaoInicialX = (pose.leftHip.x+pose.rightHip.x)/2;
    posicaoInicialY = (pose.leftHip.y+pose.rightHip.y)/2;

    limiteMaxY = posicaoInicialY-30;
  }, 5000)
}