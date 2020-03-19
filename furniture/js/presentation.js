let scene, camera, renderer, lights, object, objects, parentObject, i_object = 0, r_object, l_object, isChanged = true;

let urls = [
    'models/sofa.gltf',
    'models/chair.gltf',
    'models/sofa-2.gltf',
    'models/tv.gltf',
    'models/table-chair.gltf'
];

let animationCheck = new Object({isAnimating: false});

let left = document.getElementById('left');
let right = document.getElementById('right');

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, .75, 0);
    camera.rotation.x -= 0.15;

    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true });
    renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    document.body.appendChild(renderer.domElement);

    lights = [
        new THREE.PointLight(0xffffff, 1),
        new THREE.PointLight(0xffffff, .5),
        new THREE.PointLight(0xffffff, .5),
        new THREE.PointLight(0xffffff, .5)
    ];
    lights[0].position.set(0, 10, 10);
    lights[1].position.set(0, 0, -10);
    lights[2].position.set(10, 0, 0);
    lights[3].position.set(-10, 0, 0);
    for (let i = 0; i < lights.length; i++) {
        scene.add(lights[i]);
    }

    let parentGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    let parentMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0});
    parentObject = new THREE.Mesh(parentGeometry, parentMaterial);
    scene.add(parentObject);

    objects = new Array();
    let loader = new THREE.GLTFLoader();
    urls.forEach(url => loadModel(loader, url, objects));

    setTimeout(function() {render();}, 500);
}

function render() {
    renderer.render(scene, camera);

    if (isChanged) {
        parentObject.add(objects[i_object]);
        objects[i_object].rotation.y = 0;
        isChanged = false;
    }

    if (objects[i_object]) {
        objects[i_object].position.z = -2.5;
        objects[i_object].rotation.y += 0.0066;
    }

    document.onkeydown = function(event) {
        switch (event.keyCode) {
            case 37:
            case 65:
                animatedSwitchModel('left');
                break;
            case 39:
            case 68:
                animatedSwitchModel('right');
                break;
        }
    };

    left.onclick = function() {
        animatedSwitchModel('left');
    }
    
    right.onclick = function() {
        animatedSwitchModel('right');
    }

    requestAnimationFrame(render);
}

function loadModel(loader, url, array) {
    loader.load(url, function (gltf) {
        object = gltf.scene;
        objects.push(object);
    }, function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    }, function (error) {
        console.error(error);
    });
}

function switchModel(side) {
    switch (side) {
        case 'left':
            parentObject.remove(objects[i_object]);
            l_object = i_object;
            switch (i_object) {
                case urls.length - 1:
                    i_object = 0;
                    break;
                default:
                    i_object++;
                    break;
            }
            isChanged = true;
            break;
        case 'right':
            parentObject.remove(objects[i_object]);
            r_object = i_object;
            switch (i_object) {
                case 0:
                    i_object = urls.length - 1;
                    break;
                default:
                    i_object--;
                    break;
            }
            isChanged = true;
            break
    }
}

function switchAnimation(side) {
    this.tl = new TimelineMax({paused: true});
    this.tl.to(animationCheck, 0, {isAnimating: true});
    switch (side) {
        case 'left':
            this.tl.to(objects[i_object].position, 2, {x: -10, ease: Expo.easeOut});
            setTimeout(function() {
                switchModel('left');
                objects[i_object].position.x = 10;
                this.tl.to(objects[i_object].position, 2, {x: 0, ease: Expo.easeOut}, "=-1.7");
                isAnimating = false;
            }, 500);
            break;
        case 'right':
            this.tl.to(objects[i_object].position, 2, {x: 10, ease: Expo.easeOut});
            setTimeout(function() {
                switchModel('right');
                objects[i_object].position.x = -10;
                this.tl.to(objects[i_object].position, 2, {x: 0, ease: Expo.easeOut}, "=-1.7");
            }, 500);
            break;
    }
    this.tl.to(animationCheck, 0, {isAnimating: false}, "=-0.5");
    
    this.tl.play();
}

function animatedSwitchModel(side) {
    if (!animationCheck.isAnimating) {
        switch (side) {
            case 'left':
                switchAnimation('left');
                switchAnimation('left');
                break;
            case 'right':
                switchAnimation('right');
                switchAnimation('right');
                break;
        }
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);

init();