// @ts-nocheck
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// const pattern = new RegExp(/^(.+)\/([^/]+)$/g);

// export default class loadGLTF {
//   constructor({
//     scene = window.scene,
//     gltf,
//     name = '',
//     objectTextures = [],
//     isCastingShadow = false,
//     isMovable = false,
//     maxSize = 13,
//     position = [0, 0, 0],
//     rotation = [0, 0, 0, 0]
//   }) {
//     this.scene = scene;
//     this.gltf = gltf;
//     this.name = name;
//     this.objectTextures = objectTextures;
//     this.result = {};
//     this.position = position;
//     this.rotation = rotation;
//     this.isMovable = isMovable;
//     this.maxSize = maxSize;
//     this.isCastingShadow = isCastingShadow;
//     this.context = context;
//     this.base = null;
//   }

//   async load() {
//     // model
//     let loader = new GLTFLoader().setPath(`${this.gltf.replace(pattern, '$1')}/`);
//     const base = new THREE.Object3D();
//     base.name = `${this.name}_base`;
//     window.scene.add(base);

//     //loader
//     await loader.load(
//       this.gltf.replace(pattern, '$2'),
//       (gltf) => {
//         gltf.scene.traverse((child) => {
//           if (child.isMesh) {
//             child.material.castShadow = true;
//           }
//         });

//         let theMesh = gltf.scene;
//         this.scaleObject(theMesh);
//         this.setPosition(theMesh);
//         this.setQuaternion(theMesh);
//         let shadowMesh = this.addShadow(theMesh, base);
//         let body = this.enablePhysics(theMesh);
//         let isMeshAndShadowMoving = body
//           ? this.context.sphereShadowBases.push({
//               base,
//               theMesh,
//               shadowMesh,
//               y: theMesh.position.y,
//               body
//             })
//           : null;
//         if (this.isMovable) {
//           this.context.meshes.push(theMesh);
//         }
//         theMesh.name = this.name;
//         base.add(theMesh);
//       },
//       (xhr) => {
//         if (xhr.lengthComputable) {
//           let percentComplete = (xhr.loaded / xhr.total) * 100;
//           // console.log( 'model ' + Math.round( percentComplete, 2 ) + '% downloaded' );
//         }
//       },
//       (error) => {
//         // console.log('An error happened', error);
//       }
//     );
//     base.isNoMohre = this.isNoMohre;
//     this.base = base;
//   }

//   scaleObject(object, max_size = this.maxSize) {
//     //scale down (if necessary) the object
//     let box = new THREE.Box3().setFromObject(object);
//     let array = [];
//     array.push(box.max.x - box.min.x);
//     array.push(box.max.y - box.min.y);
//     array.push(box.max.z - box.min.z);
//     let max_of_array = Math.max.apply(Math, array);
//     object.scale.set(max_size / max_of_array, max_size / max_of_array, max_size / max_of_array);
//     return object;
//     // end of scaling
//   }

//   setPosition(object) {
//     // change position if needed
//     object.position.copy(new THREE.Vector3(this.position[0], this.position[1], this.position[2]));
//   }

//   setQuaternion(object) {
//     // change rotation if needed
//     object.quaternion.setFromAxisAngle(
//       new THREE.Vector3(this.rotation[0], this.rotation[1], this.rotation[2]),
//       this.rotation[3]
//     );
//   }

//   addShadow(theMesh, base) {
//     if (this.isCastingShadow) {
//       const shadowMat = new THREE.MeshBasicMaterial({
//         map: this.context.shadowTexture,
//         transparent: true, // so we can see the ground
//         depthWrite: false // so we don't have to sort
//       });
//       const shadowMesh = new THREE.Mesh(this.context.planeGeo, shadowMat);
//       shadowMesh.position.y = 0.01; // so we're above the ground slightly
//       shadowMesh.rotation.x = Math.PI * -0.5;
//       // const shadowSize = 0.07;
//       this.scaleObject(shadowMesh, 5);
//       // shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
//       shadowMesh.name = `${this.name}_shadow`;
//       base.add(shadowMesh);
//       return shadowMesh;
//     }
//   }

//   enablePhysics(object) {
//     //CANNON
//     if (this.isPhysicsEnable) {
//       let body = new CANNON.Body({
//         mass: 0,
//         shape: mesh2shape(object, { type: mesh2shape.Type.MESH })
//       });
//       body.position.copy(object.position);
//       body.quaternion.copy(object.quaternion);
//       body.name = `${this.name}_body`;
//       let scale = body.shapes.length > 0 ? body.shapes[0].scale.copy(object.scale) : null;
//       body.sleep();
//       // body.allowSleep = true;
//       this.world.add(body);
//       return body;
//       // body.addEventListener('collide', e => {
//       //   console.log('e',e);
//       // })
//     }
//   }
// }
export {};
