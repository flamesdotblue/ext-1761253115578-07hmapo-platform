import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function hexToColor(hex) {
  const c = new THREE.Color(hex);
  return c;
}

function buildCar({ bodyColor = '#2b2b2b', interiorColor = '#ff1a1a', wheelSize = 1, spoiler = true } = {}) {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: hexToColor(bodyColor), metalness: 0.6, roughness: 0.35 });
  const glassMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0x111111), metalness: 0.3, roughness: 0.05, transmission: 0.0, opacity: 0.9, transparent: true });
  const wheelMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x111111), roughness: 0.9 });
  const rimMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xc0c0c0), metalness: 1, roughness: 0.2 });
  const glowMat = new THREE.MeshBasicMaterial({ color: hexToColor(interiorColor) });

  // Car body
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.7, 1.6), bodyMat);
  body.position.y = 0.6;
  body.castShadow = true;
  group.add(body);

  // Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.4), glassMat);
  cabin.position.set(0.1, 1.05, 0);
  cabin.castShadow = true;
  group.add(cabin);

  // Interior glow plane
  const glow = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1.2), glowMat);
  glow.position.set(0.1, 0.85, 0);
  glow.material.transparent = true;
  glow.material.opacity = 0.7;
  group.add(glow);

  // Wheels
  const makeWheel = () => {
    const wheel = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.4 * wheelSize, 0.4 * wheelSize, 0.3, 24), wheelMat);
    tire.rotation.z = Math.PI / 2;
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.28 * wheelSize, 0.28 * wheelSize, 0.32, 12), rimMat);
    rim.rotation.z = Math.PI / 2;
    wheel.add(tire);
    wheel.add(rim);
    return wheel;
  };

  const wheelFL = makeWheel();
  wheelFL.position.set(1.2, 0.4, 0.75);
  const wheelFR = makeWheel();
  wheelFR.position.set(1.2, 0.4, -0.75);
  const wheelRL = makeWheel();
  wheelRL.position.set(-1.2, 0.4, 0.75);
  const wheelRR = makeWheel();
  wheelRR.position.set(-1.2, 0.4, -0.75);
  group.add(wheelFL, wheelFR, wheelRL, wheelRR);

  // Simple spoiler
  const spoilerGroup = new THREE.Group();
  const supportL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.1), bodyMat);
  supportL.position.set(-1.5, 1.0, 0.4);
  const supportR = supportL.clone();
  supportR.position.z = -0.4;
  const wing = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.07, 0.6), bodyMat);
  wing.position.set(-1.5, 1.15, 0);
  spoilerGroup.add(supportL, supportR, wing);
  spoilerGroup.visible = !!spoiler;
  group.add(spoilerGroup);

  group.userData = { body, cabin, glow, wheelFL, wheelFR, wheelRL, wheelRR, spoilerGroup, bodyMat, glowMat };
  return group;
}

const Viewer3D = forwardRef(function Viewer3D({ config }, ref) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const carRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0a0a');

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(5, 3, 6);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const hemi = new THREE.HemisphereLight(0xffffff, 0x080820, 0.7);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(5, 10, 5);
    dir.castShadow = true;
    scene.add(dir);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: new THREE.Color('#111111'), metalness: 0.2, roughness: 0.9 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const car = buildCar(config);
    scene.add(car);
    carRef.current = car;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    let stop = false;
    function animate() {
      if (stop) return;
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      stop = true;
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!carRef.current) return;
    const { body, glow, wheelFL, wheelFR, wheelRL, wheelRR, spoilerGroup, bodyMat, glowMat } = carRef.current.userData;
    if (body && bodyMat) bodyMat.color = hexToColor(config.bodyColor);
    if (glow && glowMat) glowMat.color = hexToColor(config.interiorColor);
    const applyWheel = (w) => {
      if (!w) return;
      const s = 1; // group scale base
      w.scale.set(1, 1, 1);
      w.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.CylinderGeometry) {
          // Cylinder radius encoded in geometry, approximate visual scale via overall scaling on Y slightly
          child.scale.set(config.wheelSize, 1, config.wheelSize);
        }
      });
    };
    applyWheel(wheelFL);
    applyWheel(wheelFR);
    applyWheel(wheelRL);
    applyWheel(wheelRR);
    if (spoilerGroup) spoilerGroup.visible = !!config.spoiler;
  }, [config]);

  useImperativeHandle(ref, () => ({
    captureImage: () => {
      const renderer = rendererRef.current;
      if (!renderer) return null;
      return renderer.domElement.toDataURL('image/png');
    }
  }));

  return (
    <div ref={mountRef} className="w-full h-[60vh] lg:h-full min-h-[420px]" />
  );
});

export default Viewer3D;
