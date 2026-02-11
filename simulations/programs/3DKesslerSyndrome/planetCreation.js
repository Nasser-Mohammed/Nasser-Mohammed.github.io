

import * as THREE from "three";

export function createKesslerSystem(debrisCount = 15000) {
    const worldGroup = new THREE.Group();
    const loader = new THREE.TextureLoader();

    // 1. Earth with Atmosphere (The "Exact Same Shit")
    const earthTexture = loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
    const earthBump = loader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');

    const earthGeom = new THREE.SphereGeometry(110, 111, 111);
    const earthMat = new THREE.MeshStandardMaterial({ 
        map: earthTexture,
        normalMap: earthBump,
        normalScale: new THREE.Vector2(0.85, 0.85),
        roughness: 0.7,
        metalness: 0.1
    });
    
    const earth = new THREE.Mesh(earthGeom, earthMat);
    earth.name = "earth";
    const earthFrame = new THREE.Group();
    earthFrame.add(earth);
    worldGroup.add(earthFrame);
    earthFrame.rotation.z = 0.41;
    //earth.rotation.y = -Math.PI / 2;
    //earth.rotation.z = 0.41; 

    // Blue Atmosphere Glow
    const atmoGeom = new THREE.SphereGeometry(65, 64, 64);
    const atmoMat = new THREE.MeshBasicMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
    });
    const atmo = new THREE.Mesh(atmoGeom, atmoMat);
    worldGroup.add(atmo);

    // 2. Debris Setup (The 150k Visuals)
    const geometries = [
        new THREE.BoxGeometry(1, 0.1, 2),
        new THREE.CylinderGeometry(0.5, 0.5, 1),
        new THREE.IcosahedronGeometry(0.8, 0),
        new THREE.TorusGeometry(0.7, 0.2, 8, 6)
    ];

    const debrisMat = new THREE.MeshStandardMaterial({
        color: 0x9a9a9a,
        metalness: 0.35,
        roughness: 0.65,
        });


    const instancedMeshes = geometries.map(geom => {
        const mesh = new THREE.InstancedMesh(geom, debrisMat, Math.ceil(debrisCount / geometries.length));
        worldGroup.add(mesh);
        return mesh;
    });

    // 3. Large Modules Setup (The Objectives)
    const moduleGeom = new THREE.CylinderGeometry(2.5, 2.5, 11, 12);
    const moduleMat = new THREE.MeshStandardMaterial({ 
        color: 0xff4400, // Safety Orange
        emissive: 0xff0000, // Red glow
        emissiveIntensity: 0.5,
        metalness: 0.5, 
        roughness: 0.2 
    });
    const instancedModules = new THREE.InstancedMesh(moduleGeom, moduleMat, 100);
    worldGroup.add(instancedModules);

    const randEuler = () => new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    const minR = 400;
    // --- ARRAY 1: DEBRIS DATA ---
    const debrisData = [];
    for (let i = 0; i < debrisCount; i++) {
        const r = minR + Math.random() * 200; 
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        debrisData.push({
            radius: r,
            theta: theta,
            phi: phi,
            speed: Math.sqrt(4000 / r) * 0.01,
            currentRot: randEuler(),
            tumbleVel: new THREE.Vector3(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02),
            meshIndex: i % geometries.length,
            instanceIndex: Math.floor(i / geometries.length)
        });
    }

    // --- MODULE FRAMES (CAPTURE TARGETS) ---
    const modulesData = [];
    const moduleCount = 50;

    for (let i = 0; i < moduleCount; i++) {

        const r = minR + Math.random() * 80;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);

        // ----------------------------
        // Module frame
        // ----------------------------
        const frame = new THREE.Group();

        // Body
        const body = new THREE.Mesh(moduleGeom, moduleMat);
        frame.add(body);

        // ----------------------------
        // Docking interface
        // ----------------------------
        const dock = new THREE.Mesh(
            new THREE.TorusGeometry(.8, 0.12, 16, 32),
            new THREE.MeshStandardMaterial({
            color: 0x00ffaa,
            emissive: 0x00aa88,
            emissiveIntensity: 0.6,
            metalness: 0.4,
            roughness: 0.3
            })
        );

        //dock.rotation.x = Math.PI / 2;
        dock.position.z = 3.0; // end of cylinder
        frame.add(dock);

        modulesData.push({
            frame,

            orbit: {
            radius: r,
            theta,
            phi,
            speed: Math.sqrt(4000 / r) * 0.004
            },

            spin: {
            rot: randEuler(),
            omega: new THREE.Vector3(
                0, 0, 0
            )
            },

            dock
        });
        }


   return {
        worldGroup,
        instancedMeshes,
        debrisData,
        modulesData,   // now contains frames
        earthFrame
        };

}


export function createSun() {
    const sunGroup = new THREE.Group();
    const sunPos = new THREE.Vector3(0, 100, -5000);

    // Blinding Core
    const core = new THREE.Mesh(
        new THREE.SphereGeometry(400, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    core.position.copy(sunPos);
    sunGroup.add(core);

    // Heat Glow (Additive Blending)
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(600, 32, 32),
        new THREE.MeshBasicMaterial({ 
            color: 0xffaa00, 
            transparent: true, 
            opacity: 0.3, 
            blending: THREE.AdditiveBlending 
        })
    );
    glow.position.copy(sunPos);
    sunGroup.add(glow);

    // Directional Light for sharp shadows
    const light = new THREE.DirectionalLight(0xffffff, 2.0);
    light.position.copy(sunPos);
    sunGroup.add(light);

    return sunGroup;
}

export function createStarfield() {
    const vertices = [];
    for (let i = 0; i < 100; i++) {
        vertices.push(THREE.MathUtils.randFloatSpread(5000), THREE.MathUtils.randFloatSpread(5000), THREE.MathUtils.randFloatSpread(5000));
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return new THREE.Points(geom, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: false }));
}