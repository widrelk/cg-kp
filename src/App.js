import logo from './logo.svg';
import './App.css';

import React, {useEffect, useLayoutEffect, useRef} from 'react';
import { extend, Canvas, } from "@react-three/fiber";
import {OrbitControls, PerspectiveCamera} from "@react-three/drei";
// import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { DoubleSide } from "three";

// const test = () =>  {
//   // const geometry = new THREE.BufferGeometry();

//   // const indices = [];

//   // const vertices = [];
//   // const normals = [];
//   // const colors = [];

//   // const size = 20;
//   // const segments = 10;

//   // const halfSize = size / 2;
// 	// const segmentSize = size / segments;

//   // // generate vertices, normals and color data for a simple grid geometry

//   // for (let i = 0; i <= segments; i++) {
//   //   const y = (i * segmentSize) - halfSize;
//   //   for (let j = 0; j <= segments; j++) {
//   //     const x = (j * segmentSize) - halfSize;
//   //     vertices.push(x, - y, 0);
//   //     normals.push(0, 0, 1);
//   //     const r = (x / size) + 0.5;
//   //     const g = (y / size) + 0.5;
//   //     colors.push(r, g, 1);
//   //   }
//   // }

//   // // generate indices (data for element array buffer)
//   // for (let i = 0; i < segments; i++) {
//   //   for (let j = 0; j < segments; j++) {
//   //     const a = i * (segments + 1) + (j + 1);
//   //     const b = i * (segments + 1) + j;
//   //     const c = (i + 1) * (segments + 1) + j;
//   //     const d = (i + 1) * (segments + 1) + (j + 1);

//   //     // generate two faces (triangles) per iteration
//   //     indices.push(a, b, d); // face one
//   //     indices.push(b, c, d); // face two

//   //   }
//   // }
//   // geometry.setIndex( indices );
//   // geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
//   // geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
//   // geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

//   // const material = new THREE.MeshPhongMaterial({
//   //   side: THREE.DoubleSide,
//   //   vertexColors: true
//   // });

// 	// let mesh = new THREE.Mesh( geometry, material );
  
//   const vertices = new Float32Array( [
//     -1.0, -1.0,  1.0,
//      1.0, -1.0,  1.0,
//      1.0,  1.0,  1.0,
  
//      1.0,  1.0,  1.0,
//     -1.0,  1.0,  1.0,
//     -1.0, -1.0,  1.0
//   ] );

//   return (
//     <mesh position={[1, 1, 1]}>
//       <bufferGeometry position={new THREE.BufferAttribute( new Float32Array(vertices), 3 )}/>
//       <meshBasicMaterial color='0xff0000'/>
//     </mesh>
//   );

// }

function App() {


  const makeGrid = (width, height) => {
    let grid = [];
    for (let row = 0; row < height; row++){
      let currRow = [];
      for (let column = 0; column < width; column++) {
        let angle = Math.random() * Math.PI * 2;
        let x = Math.cos(angle);
        let y = Math.sin(angle);
        currRow.push({x, y, angle})
      }
      grid.push(currRow);
    }
    return(grid);
  }

  let grid = makeGrid(5, 5);
  
  // const vertices = new Float32Array([
  //   0.0, 0.0,  0.0,
  //   0.0, 1.0,  0.0,
  //   1.0, 0.0,  0.0,
      
  //   1.0, 0.0,  0.0,
  //   0.0, 1.0,  0.0,
  //   1.0, 1.0,  3.0
  // ]);

  // const heights = [
  //   [0, 0.5, 1, 1.5],
  //   [0.5, 1, 1.5, 2],
  //   [0.5, 1, 1.5, 1.5],
  //   [0, 0.5, 1, 1.5],
  // ]
  const heights = [
    [0, 0.5, 1, 1.5],
    [0.5, 1, 1.5, 2],
    [0.5, 1, 1.5, 1.5],
    [0, 0.5, 1, 0],
  ]

  const testFunc = (heights) => {
    let vertices = [];
    for (let row = 0; row < heights.length - 1; row++){
      for (let column = 0; column < heights[row].length - 1; column++) {
        // Верхняя левая
        vertices.push(row);
        vertices.push(heights[row][column]);
        vertices.push(column);
        // Верхняя правая
        vertices.push(row);
        vertices.push(heights[row][column + 1]);
        vertices.push(column + 1);
        // Нижняя
        vertices.push(row + 1);
        vertices.push(heights[row + 1][column]);
        vertices.push(column);

        // Верхняя
        vertices.push(row);
        vertices.push(heights[row][column + 1]);
        vertices.push(column + 1);
        // Нижняя правая
        vertices.push(row + 1);
        vertices.push(heights[row + 1][column + 1]);
        vertices.push(column + 1);
        // Нижняя левая
        vertices.push(row + 1);
        vertices.push(heights[row + 1][column]);
        vertices.push(column);

      }
    }
    return new Float32Array(vertices);
  }

  let testResult = testFunc(heights);
  

  const vertices = new Float32Array([
    1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,

    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,
    -1.0, -1.0, 1.0

  ]);

  const vertices2 = new Float32Array([
    0.0, 0.0, 0,
    0.0, 0.5, 1,
    1, 0.5, 0,

  ])

  console.log(vertices);
  console.log('testresult')
  console.log(testResult)

  return (
    <div className="App">
      <Canvas
        style={{width: '1000px', height: '800px', border: '1px solid black'}} 
        camera={{ position: [0, 0, 0], near: 0.1, far: 1000, }}
      >
        <ambientLight />
        <directionalLight
          intensity={0.5}
          castShadow
          shadow-mapSize-height={512}
          shadow-mapSize-width={512}
        />

        <mesh position={[1, 1, 1]}>
          <bufferGeometry>
            <bufferAttribute
              attachObject={["attributes", "position"]}
              array={testResult}
              itemSize={3}
              count={54}
            />
          </bufferGeometry>
          <meshBasicMaterial attach='material' color="red" side={DoubleSide} />
        </mesh>

        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1]}>
          <planeBufferGeometry attach='geometry' />
          <meshBasicMaterial attach='material' color="green" side={DoubleSide} />
        </mesh>



        <PerspectiveCamera position={[0, 20, 20]} makeDefault />
        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75}/>
      </Canvas>
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
      </header>
    </div>
  );
}

export default App;
