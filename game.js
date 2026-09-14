/**
 * ==========================================================================
 * Nibble Snake // Cheerful Garden Adventure Game Script
 * Pure Vanilla JavaScript (Zero Dependencies, Zero Build Steps)
 * ==========================================================================
 */

'use strict';

/**
 * Game Configuration & Constants
 */
const CONFIG = {
  GRID_SIZE: 20,          // 20x20 grid
  CANVAS_SIZE: 300,        // 300px x 300px (15px per cell)
  CELL_SIZE: 15,
  TICK_INTERVAL_MS: 130,   // Classic Nokia-style pacing
  STORAGE_KEY: 'retro_phone_snake_best_score',
  THEME_STORAGE_KEY: 'snake_selected_theme',
  AUDIO_STORAGE_KEY: 'snake_audio_muted',
  VIEW_STORAGE_KEY: 'snake_view_mode',
  THEMES: {
    garden: {
      id: 'garden',
      bodyClass: 'theme-garden',
      icon: '☀️',
      toggleLabel: 'Garden',
      title: 'Nibble Snake // Cheerful Garden Adventure',
      brandTag: '🌱 Garden Nibble',
      scoreLabel: 'SNACKS EATEN',
      bestLabel: 'BEST FEAST',
      btnStart: 'PLAY',
      btnPause: 'PAUSE',
      btnResume: 'RESUME',
      btnReset: 'START OVER',
      overlayReadyTitle: 'READY TO SNACK?',
      overlayReadySub: 'Press Play or any Arrow key to begin!',
      overlayPausedTitle: 'PAUSED',
      overlayPausedSub: 'Take a quick breather!\nPress Space or Play to resume',
      overlayWinTitle: 'Hooray! Garden Cleared!',
      overlayWinSub: 'You ate every berry! Final Score: ',
      overlayLoseTitle: 'Good Try!',
      reasonWall: 'Bumped into the fence!',
      reasonSelf: 'Tangled in your tail!',
      overlayRestartHint: 'Press [Start Over] or Enter to play again!',
      guidanceTitle: 'HOW TO PLAY',
      guidanceTip: '<strong>Friendly Tip:</strong> Collect sweet berries to grow longer. Be gentle and watch out for fences and your own tail!',
      FIELD_BG: '#ecfdf5',
      GRID_LINE: 'rgba(16, 185, 129, 0.08)',
      SNAKE_HEAD: '#059669',
      SNAKE_EYE: '#ffffff',
      SNAKE_PUPIL: '#064e3b',
      SNAKE_BODY: '#34d399',
      SNAKE_CORE: '#10b981',
      FOOD: '#f43f5e',
      FOOD_LEAF: '#10b981'
    },
    cyber: {
      id: 'cyber',
      bodyClass: 'theme-cyber',
      icon: '🌙',
      toggleLabel: 'Cyber',
      title: 'CyberSnake // Direct Terminal',
      brandTag: 'SYS//NODE-01',
      scoreLabel: 'SCORE',
      bestLabel: 'DEVICE BEST',
      btnStart: 'ENGAGE',
      btnPause: 'FREEZE',
      btnResume: 'RESUME',
      btnReset: 'REBOOT',
      overlayReadyTitle: 'SYSTEM READY',
      overlayReadySub: 'Press Engage or any Arrow key to begin!',
      overlayPausedTitle: 'SIMULATION FROZEN',
      overlayPausedSub: 'Press Space or Resume to continue',
      overlayWinTitle: 'VICTORY!',
      overlayWinSub: 'Full Matrix Cleared! Score: ',
      overlayLoseTitle: 'SYSTEM TERMINATED',
      reasonWall: 'PERIMETER BREACH',
      reasonSelf: 'SELF COLLISION',
      overlayRestartHint: 'Press [Reboot] or Enter to restart',
      guidanceTitle: 'TACTICAL CONTROLS',
      guidanceTip: '<strong>Protocol:</strong> Absorb energy nodes. Perimeter collision or self-intersection causes system termination.',
      FIELD_BG: '#080c14',
      GRID_LINE: 'rgba(0, 240, 255, 0.05)',
      SNAKE_HEAD: '#00f0ff',
      SNAKE_EYE: '#080c14',
      SNAKE_PUPIL: '#00f0ff',
      SNAKE_BODY: '#151d2e',
      SNAKE_CORE: '#008899',
      FOOD: '#00f0ff',
      FOOD_LEAF: '#00f0ff'
    }
  }
};

/**
 * Direction vectors
 */
const DIRECTIONS = {
  UP:    { x: 0,  y: -1, name: 'UP' },
  DOWN:  { x: 0,  y: 1,  name: 'DOWN' },
  LEFT:  { x: -1, y: 0,  name: 'LEFT' },
  RIGHT: { x: 1,  y: 0,  name: 'RIGHT' }
};

/**
 * Opposites map to prevent 180-degree instant reversal
 */
const OPPOSITE_DIRECTIONS = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT'
};

/**
 * ==========================================================================
 * 1. Pure Game Engine (Rules & State Separation)
 * ==========================================================================
 */
class SnakeEngine {
  constructor(gridSize = CONFIG.GRID_SIZE) {
    this.gridSize = gridSize;
    this.bestScore = this.loadBestScore();
    this.reset();
  }

  /**
   * Safely loads the best score from localStorage.
   */
  loadBestScore() {
    try {
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Safely saves the best score to localStorage.
   */
  saveBestScore() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, String(this.bestScore));
    } catch {
      // Ignore in restricted environments
    }
  }

  /**
   * Resets game state to initial 'READY' position.
   */
  reset() {
    this.status = 'READY'; // 'READY' | 'RUNNING' | 'PAUSED' | 'GAME_OVER'
    this.score = 0;
    this.bestScore = this.loadBestScore();
    this.direction = DIRECTIONS.RIGHT;
    this.pendingDirection = DIRECTIONS.RIGHT;

    // Start with 3 segments centered horizontally
    const midY = Math.floor(this.gridSize / 2);
    this.snake = [
      { x: 6, y: midY }, // Head
      { x: 5, y: midY }, // Body
      { x: 4, y: midY }  // Tail
    ];

    this.food = this.spawnFood();
  }

  /**
   * Generates a food position not colliding with the snake body.
   */
  spawnFood() {
    const emptyCells = [];
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        const isOccupied = this.snake.some(segment => segment.x === x && segment.y === y);
        if (!isOccupied) {
          emptyCells.push({ x, y });
        }
      }
    }

    if (emptyCells.length === 0) {
      // Board fully occupied (Game Won!)
      return null;
    }

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  /**
   * Queues a direction change if valid (not opposite).
   */
  setDirection(newDirection) {
    if (!newDirection) return false;
    if (OPPOSITE_DIRECTIONS[newDirection.name] === this.direction.name) {
      return false; // Cannot reverse into own neck
    }
    this.pendingDirection = newDirection;
    return true;
  }

  /**
   * Advances game by 1 tick.
   * Returns: { moved: boolean, ateFood: boolean, gameOver: boolean, won: boolean }
   */
  step() {
    if (this.status !== 'RUNNING') {
      return { moved: false, ateFood: false, gameOver: false, won: false };
    }

    this.direction = this.pendingDirection;
    const head = this.snake[0];
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };

    // 1. Wall Collision Check
    const hitWall =
      newHead.x < 0 ||
      newHead.x >= this.gridSize ||
      newHead.y < 0 ||
      newHead.y >= this.gridSize;

    if (hitWall) {
      this.status = 'GAME_OVER';
      return { moved: false, ateFood: false, gameOver: true, reason: 'WALL' };
    }

    // 2. Self-Collision Check (check against all existing body segments)
    const hitSelf = this.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y);
    if (hitSelf) {
      this.status = 'GAME_OVER';
      return { moved: false, ateFood: false, gameOver: true, reason: 'SELF' };
    }

    // 3. Move snake forward
    this.snake.unshift(newHead);

    // 4. Food collision check
    let ateFood = false;
    if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
      ateFood = true;
      this.score += 1;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        this.saveBestScore();
      }
      this.food = this.spawnFood();

      if (!this.food) {
        // Player filled the entire grid
        this.status = 'GAME_OVER';
        return { moved: true, ateFood: true, gameOver: true, won: true };
      }
    } else {
      // Remove tail segment if food was not eaten
      this.snake.pop();
    }

    return { moved: true, ateFood, gameOver: false };
  }
}

/**
 * ==========================================================================
 * 2. Visual Renderer (Garden Canvas)
 * ==========================================================================
 */
class SnakeRenderer {
  constructor(canvas, config = CONFIG) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = config;
  }

  /**
   * Renders the current state onto the canvas using the active theme.
   */
  render(engine, themeConfig = CONFIG.THEMES.garden) {
    const { ctx, config } = this;
    const { CELL_SIZE, CANVAS_SIZE } = config;
    const isCyber = themeConfig.id === 'cyber';

    // 1. Clear field background
    ctx.fillStyle = themeConfig.FIELD_BG;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 2. Draw subtle grid lines
    ctx.strokeStyle = themeConfig.GRID_LINE;
    ctx.lineWidth = 1;
    for (let i = 0; i <= config.GRID_SIZE; i++) {
      const pos = i * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, CANVAS_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(CANVAS_SIZE, pos);
      ctx.stroke();
    }

    // 3. Draw Food (Berry in Garden, Energy Node in Cyber)
    if (engine.food) {
      const fx = engine.food.x * CELL_SIZE;
      const fy = engine.food.y * CELL_SIZE;

      if (isCyber) {
        // Neon cyan cross energy node
        ctx.fillStyle = themeConfig.FOOD;
        ctx.fillRect(fx + 3, fy + 1, CELL_SIZE - 6, CELL_SIZE - 2);
        ctx.fillRect(fx + 1, fy + 3, CELL_SIZE - 2, CELL_SIZE - 6);

        // Bright energy core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(fx + 5, fy + 5, CELL_SIZE - 10, CELL_SIZE - 10);
      } else {
        // Leaf stem (cheerful green leaf on top)
        ctx.fillStyle = themeConfig.FOOD_LEAF;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(fx + 6, fy + 1, 4, 3, 1.5);
        } else {
          ctx.rect(fx + 6, fy + 1, 4, 3);
        }
        ctx.fill();

        // Rounded berry shape
        ctx.fillStyle = themeConfig.FOOD;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(fx + 2, fy + 4, CELL_SIZE - 4, CELL_SIZE - 5, 4);
        } else {
          ctx.rect(fx + 2, fy + 4, CELL_SIZE - 4, CELL_SIZE - 5);
        }
        ctx.fill();

        // Sweet shine spot (soft curved highlight)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(fx + 5, fy + 7, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Draw Snake Segments
    engine.snake.forEach((segment, index) => {
      const sx = segment.x * CELL_SIZE;
      const sy = segment.y * CELL_SIZE;

      if (index === 0) {
        // Head
        if (isCyber) {
          // Vivid neon cyan segment
          ctx.fillStyle = themeConfig.SNAKE_HEAD;
          ctx.fillRect(sx + 1, sy + 1, CELL_SIZE - 2, CELL_SIZE - 2);

          // Dark sensor eyes
          ctx.fillStyle = themeConfig.SNAKE_EYE;
          if (engine.direction === DIRECTIONS.UP || engine.direction === DIRECTIONS.DOWN) {
            ctx.fillRect(sx + 3, sy + 5, 3, 3);
            ctx.fillRect(sx + CELL_SIZE - 6, sy + 5, 3, 3);
          } else {
            ctx.fillRect(sx + 5, sy + 3, 3, 3);
            ctx.fillRect(sx + 5, sy + CELL_SIZE - 6, 3, 3);
          }
        } else {
          // Cheerful emerald segment with smooth rounded corners
          ctx.fillStyle = themeConfig.SNAKE_HEAD;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(sx + 1, sy + 1, CELL_SIZE - 2, CELL_SIZE - 2, 4);
          } else {
            ctx.rect(sx + 1, sy + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          }
          ctx.fill();

          // Expressive friendly eyes
          let eye1X, eye1Y, eye2X, eye2Y;
          let pup1X, pup1Y, pup2X, pup2Y;

          if (engine.direction === DIRECTIONS.UP || engine.direction === DIRECTIONS.DOWN) {
            eye1X = sx + 4; eye1Y = sy + 5;
            eye2X = sx + CELL_SIZE - 4; eye2Y = sy + 5;
            const yOff = engine.direction === DIRECTIONS.UP ? -1 : 1;
            pup1X = eye1X; pup1Y = eye1Y + yOff;
            pup2X = eye2X; pup2Y = eye2Y + yOff;
          } else {
            eye1X = sx + 5; eye1Y = sy + 4;
            eye2X = sx + 5; eye2Y = sy + CELL_SIZE - 4;
            const xOff = engine.direction === DIRECTIONS.LEFT ? -1 : 1;
            pup1X = eye1X + xOff; pup1Y = eye1Y;
            pup2X = eye2X + xOff; pup2Y = eye2Y;
          }

          // Draw white eye sclera
          ctx.fillStyle = themeConfig.SNAKE_EYE;
          ctx.beginPath();
          ctx.arc(eye1X, eye1Y, 2.5, 0, Math.PI * 2);
          ctx.arc(eye2X, eye2Y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Draw dark pupils
          ctx.fillStyle = themeConfig.SNAKE_PUPIL;
          ctx.beginPath();
          ctx.arc(pup1X, pup1Y, 1.3, 0, Math.PI * 2);
          ctx.arc(pup2X, pup2Y, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Body
        if (isCyber) {
          // Carbon-slate segment
          ctx.fillStyle = themeConfig.SNAKE_BODY;
          ctx.fillRect(sx + 1, sy + 1, CELL_SIZE - 2, CELL_SIZE - 2);

          // Glowing cyan core node
          ctx.fillStyle = themeConfig.SNAKE_CORE;
          ctx.fillRect(sx + 5, sy + 5, CELL_SIZE - 10, CELL_SIZE - 10);
        } else {
          // Soft mint green segment with smooth rounded corners
          ctx.fillStyle = themeConfig.SNAKE_BODY;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(sx + 1, sy + 1, CELL_SIZE - 2, CELL_SIZE - 2, 3);
          } else {
            ctx.rect(sx + 1, sy + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          }
          ctx.fill();

          // Gentle central core dot
          ctx.fillStyle = themeConfig.SNAKE_CORE;
          ctx.beginPath();
          ctx.arc(sx + CELL_SIZE / 2, sy + CELL_SIZE / 2, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }
}

/**
 * ==========================================================================
 * 2b. Optional 3D Visual Renderer (Three.js WebGL Mode)
 * Renders the same 20x20 SnakeEngine grid in 3D with isometric perspective,
 * smooth lighting, procedural materials, and a 60 FPS animation loop.
 * ==========================================================================
 */
class Snake3DRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.isSupported = false;
    this.animating = false;
    this.animFrameId = null;
    this.activeTheme = null;

    // Mesh caches
    this.snakeMeshes = [];
    this.foodMesh = null;
    this.boardMesh = null;
    this.gridHelper = null;

    this.initThree();
  }

  initThree() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js library is not available. 3D mode disabled.');
      return;
    }

    try {
      // 1. WebGL Renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'default'
      });
      this.renderer.setSize(300, 300, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // 2. Scene
      this.scene = new THREE.Scene();

      // 3. Camera (Elevated isometric perspective)
      this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 1000);
      this.camera.position.set(0, 25, 20);
      this.camera.lookAt(0, -0.5, 1.5);

      // 4. Lights
      this.ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
      this.scene.add(this.ambientLight);

      this.dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
      this.dirLight.position.set(12, 24, 14);
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.scene.add(this.dirLight);

      // 5. Board (Ground plane with subtle raised rim)
      const boardGeo = new THREE.BoxGeometry(20.4, 0.4, 20.4);
      this.boardMat = new THREE.MeshStandardMaterial({
        color: 0xecfdf5,
        roughness: 0.8,
        metalness: 0.1
      });
      this.boardMesh = new THREE.Mesh(boardGeo, this.boardMat);
      this.boardMesh.position.y = -0.2;
      this.boardMesh.receiveShadow = true;
      this.scene.add(this.boardMesh);

      // Perimeter rim / wall indicator
      const rimGeo = new THREE.BoxGeometry(20.8, 0.35, 20.8);
      this.rimMat = new THREE.MeshStandardMaterial({
        color: 0xcbd5e1,
        roughness: 0.6
      });
      this.rimMesh = new THREE.Mesh(rimGeo, this.rimMat);
      this.rimMesh.position.y = -0.3;
      this.scene.add(this.rimMesh);

      // Subtle Grid lines
      this.gridHelper = new THREE.GridHelper(20, 20, 0x10b981, 0x10b981);
      this.gridHelper.position.y = 0.02;
      if (this.gridHelper.material) {
        this.gridHelper.material.opacity = 0.2;
        this.gridHelper.material.transparent = true;
      }
      this.scene.add(this.gridHelper);

      // Snake Segment Geometries
      this.headGeo = new THREE.BoxGeometry(0.92, 0.85, 0.92);
      this.bodyGeo = new THREE.BoxGeometry(0.85, 0.72, 0.85);
      this.eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);

      this.isSupported = true;
    } catch (err) {
      console.warn('WebGL initialization failed. Falling back to 2D:', err);
      this.isSupported = false;
    }
  }

  updateTheme(themeConfig) {
    if (!this.isSupported) return;
    this.activeTheme = themeConfig;
    const isCyber = themeConfig.id === 'cyber';

    // Update board color & background
    const bgHex = parseInt(themeConfig.FIELD_BG.replace('#', '0x'), 16);
    this.renderer.setClearColor(bgHex, 1);

    if (this.boardMat) {
      this.boardMat.color.setHex(bgHex);
      this.boardMat.roughness = isCyber ? 0.4 : 0.8;
      this.boardMat.metalness = isCyber ? 0.3 : 0.1;
    }

    if (this.rimMat) {
      const rimColor = isCyber ? 0x233152 : 0xcbd5e1;
      this.rimMat.color.setHex(rimColor);
    }

    if (this.gridHelper) {
      const gridColor = isCyber ? 0x00f0ff : 0x10b981;
      this.gridHelper.material.color.setHex(gridColor);
      this.gridHelper.material.opacity = isCyber ? 0.25 : 0.15;
    }

    // Recreate food mesh for the new theme
    if (this.foodMesh) {
      this.scene.remove(this.foodMesh);
      this.foodMesh = null;
    }
  }

  getFoodMesh(themeConfig) {
    const isCyber = themeConfig.id === 'cyber';
    const group = new THREE.Group();

    if (isCyber) {
      // Tactical neon energy octahedron
      const geo = new THREE.OctahedronGeometry(0.48, 0);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00a8cc,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      group.add(mesh);
    } else {
      // Cheerful sweet red berry with a green leaf stem
      const berryGeo = new THREE.SphereGeometry(0.44, 14, 14);
      const berryMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        roughness: 0.3,
        metalness: 0.1
      });
      const berry = new THREE.Mesh(berryGeo, berryMat);
      berry.castShadow = true;
      group.add(berry);

      // Green stem leaf
      const stemGeo = new THREE.ConeGeometry(0.15, 0.3, 5);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(0, 0.45, 0);
      stem.rotation.z = 0.3;
      group.add(stem);
    }

    return group;
  }

  render(engine, themeConfig = CONFIG.THEMES.garden) {
    if (!this.isSupported) return;

    if (!this.activeTheme || this.activeTheme.id !== themeConfig.id) {
      this.updateTheme(themeConfig);
    }

    const isCyber = themeConfig.id === 'cyber';

    // 1. Render / Sync Snake Meshes
    const snake = engine.snake;
    while (this.snakeMeshes.length < snake.length) {
      const idx = this.snakeMeshes.length;
      const isHead = idx === 0;

      const group = new THREE.Group();
      const geo = isHead ? this.headGeo : this.bodyGeo;
      const mat = new THREE.MeshStandardMaterial({
        roughness: isCyber ? 0.3 : 0.5,
        metalness: isCyber ? 0.4 : 0.1
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      // Eyes on head
      if (isHead) {
        const eyeMat = new THREE.MeshBasicMaterial({ color: isCyber ? 0x080c14 : 0xffffff });
        const pupilMat = new THREE.MeshBasicMaterial({ color: isCyber ? 0x00f0ff : 0x064e3b });

        const leftEye = new THREE.Mesh(this.eyeGeo, eyeMat);
        leftEye.position.set(-0.24, 0.28, -0.32);
        const leftPupil = new THREE.Mesh(this.eyeGeo, pupilMat);
        leftPupil.scale.set(0.5, 0.5, 0.5);
        leftPupil.position.set(-0.24, 0.28, -0.42);

        const rightEye = new THREE.Mesh(this.eyeGeo, eyeMat);
        rightEye.position.set(0.24, 0.28, -0.32);
        const rightPupil = new THREE.Mesh(this.eyeGeo, pupilMat);
        rightPupil.scale.set(0.5, 0.5, 0.5);
        rightPupil.position.set(0.24, 0.28, -0.42);

        group.add(leftEye, leftPupil, rightEye, rightPupil);
      }

      this.scene.add(group);
      this.snakeMeshes.push({ group, mesh, isHead });
    }

    // Hide extra meshes if snake shrunk (e.g. on reset)
    for (let i = 0; i < this.snakeMeshes.length; i++) {
      if (i < snake.length) {
        this.snakeMeshes[i].group.visible = true;
        const seg = snake[i];
        // Grid mapping: (0..19) -> (-9.5 .. +9.5)
        const x3d = seg.x - 9.5;
        const z3d = seg.y - 9.5;
        this.snakeMeshes[i].group.position.set(x3d, 0.45, z3d);

        // Update colors based on theme & segment position
        const isHead = i === 0;
        const meshMat = this.snakeMeshes[i].mesh.material;
        if (isCyber) {
          meshMat.color.setHex(isHead ? 0x00f0ff : 0x151d2e);
          meshMat.emissive.setHex(isHead ? 0x004455 : 0x002233);
        } else {
          meshMat.color.setHex(isHead ? 0x059669 : 0x34d399);
          meshMat.emissive.setHex(0x000000);
        }
      } else {
        this.snakeMeshes[i].group.visible = false;
      }
    }

    // 2. Render Food
    if (engine.food) {
      if (!this.foodMesh) {
        this.foodMesh = this.getFoodMesh(themeConfig);
        this.scene.add(this.foodMesh);
      }
      this.foodMesh.visible = true;
      this.foodMesh.position.set(engine.food.x - 9.5, 0.65, engine.food.y - 9.5);
    } else if (this.foodMesh) {
      this.foodMesh.visible = false;
    }

    // Render single frame
    this.renderer.render(this.scene, this.camera);
  }

  startLoop() {
    if (!this.isSupported || this.animating) return;
    this.animating = true;

    const animate = () => {
      if (!this.animating) return;
      this.animFrameId = requestAnimationFrame(animate);

      // Subtle 60 FPS animation for food
      if (this.foodMesh && this.foodMesh.visible) {
        this.foodMesh.rotation.y += 0.035;
        this.foodMesh.position.y = 0.65 + Math.sin(Date.now() * 0.005) * 0.08;
      }

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  stopLoop() {
    this.animating = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  handleResize() {
    if (!this.renderer || !this.camera) return;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || 300;
    const h = rect.height || 300;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }
}

/**
 * ==========================================================================
 * 3. Sound Engine (Native Web Audio API Synthesis)
 * Procedural background loops and short effects. Zero external files.
 * Strictly respects browser autoplay policies and device mute preference.
 * ==========================================================================
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.activeTheme = 'garden';
    this.isMuted = this.loadMutedPreference();
    this.unlocked = false;
  }

  loadMutedPreference() {
    try {
      const saved = localStorage.getItem(CONFIG.AUDIO_STORAGE_KEY);
      return saved === 'true'; // Default is false (unmuted, pending user gesture)
    } catch {
      return false;
    }
  }

  saveMutedPreference(muted) {
    try {
      localStorage.setItem(CONFIG.AUDIO_STORAGE_KEY, muted ? 'true' : 'false');
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Initializes or resumes AudioContext strictly in response to an explicit user interaction.
   * This guarantees full compliance with the browser autoplay policy.
   */
  initOnUserGesture() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      try {
        this.ctx = new AudioContextClass();

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.28, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // BGM Gain node
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);

        // SFX Gain node
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.unlocked = true;
      } catch {
        // Web Audio not allowed or failed
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.unlocked = true;
      }).catch(() => {});
    }
  }

  setMuted(muted) {
    this.isMuted = !!muted;
    this.saveMutedPreference(this.isMuted);

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.28, now);
    }

    if (this.isMuted) {
      this.stopBgm();
    }
  }

  toggleMute() {
    this.initOnUserGesture();
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Play a clean procedural tone with attack and exponential decay.
   */
  playTone({ freq, type = 'sine', duration = 0.1, gainVal = 0.2, freqEnd = null, delay = 0 }) {
    if (!this.ctx || this.isMuted || this.ctx.state !== 'running') return;

    try {
      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (freqEnd !== null && freqEnd > 0) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, freqEnd), t0 + duration);
      }

      gain.gain.setValueAtTime(gainVal, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain || this.masterGain);

      osc.start(t0);
      osc.stop(t0 + duration + 0.05);
    } catch {
      // Non-blocking audio safeguard
    }
  }

  /**
   * Sound effect: Eat snack
   */
  playEat(theme = 'garden') {
    if (this.isMuted) return;
    this.initOnUserGesture();

    if (theme === 'cyber') {
      // Tactical cyber energy pickup blip (quick saw ramp)
      this.playTone({ freq: 280, freqEnd: 1100, type: 'sawtooth', duration: 0.08, gainVal: 0.18 });
    } else {
      // Cheerful garden double bell/chime
      this.playTone({ freq: 523.25, type: 'sine', duration: 0.09, gainVal: 0.22, delay: 0 });
      this.playTone({ freq: 783.99, type: 'triangle', duration: 0.13, gainVal: 0.24, delay: 0.06 });
    }
  }

  /**
   * Sound effect: Turn / Direction change (subtle micro-tick)
   */
  playTurn(theme = 'garden') {
    if (this.isMuted) return;
    this.initOnUserGesture();

    if (theme === 'cyber') {
      this.playTone({ freq: 650, type: 'square', duration: 0.02, gainVal: 0.03 });
    } else {
      this.playTone({ freq: 440, type: 'sine', duration: 0.02, gainVal: 0.035 });
    }
  }

  /**
   * Sound effect: Start / Resume game
   */
  playStart(theme = 'garden') {
    if (this.isMuted) return;
    this.initOnUserGesture();

    if (theme === 'cyber') {
      this.playTone({ freq: 160, freqEnd: 640, type: 'sawtooth', duration: 0.14, gainVal: 0.16 });
    } else {
      this.playTone({ freq: 392.00, type: 'triangle', duration: 0.08, gainVal: 0.18, delay: 0 });
      this.playTone({ freq: 523.25, type: 'triangle', duration: 0.08, gainVal: 0.19, delay: 0.06 });
      this.playTone({ freq: 659.25, type: 'triangle', duration: 0.12, gainVal: 0.20, delay: 0.12 });
    }
  }

  /**
   * Sound effect: Game Over
   */
  playGameOver(theme = 'garden') {
    if (this.isMuted) return;
    this.initOnUserGesture();

    if (theme === 'cyber') {
      // Harsh system shutdown pitch-drop
      this.playTone({ freq: 420, freqEnd: 60, type: 'sawtooth', duration: 0.35, gainVal: 0.25 });
    } else {
      // Soft gentle sorrow chime
      this.playTone({ freq: 440.0, type: 'sine', duration: 0.14, gainVal: 0.20, delay: 0 });
      this.playTone({ freq: 349.2, type: 'sine', duration: 0.16, gainVal: 0.20, delay: 0.11 });
      this.playTone({ freq: 261.6, type: 'triangle', duration: 0.26, gainVal: 0.22, delay: 0.23 });
    }
  }

  /**
   * Sound effect: Tactile button click
   */
  playButton() {
    if (this.isMuted) return;
    this.initOnUserGesture();
    this.playTone({ freq: 550, type: 'sine', duration: 0.025, gainVal: 0.05 });
  }

  /**
   * Start Procedural Background Audio (BGM) loop while running.
   */
  startBgm(theme = 'garden') {
    this.activeTheme = theme;
    if (this.isMuted) return;
    this.initOnUserGesture();
    this.stopBgm();

    // Garden Pentatonic: gentle, warm, peaceful notes (C4, E4, G4, A4, G4, E4, D4, C4)
    const gardenNotes = [261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66, 261.63];
    // Cyber Synthwave Pulse: driving tactical bass notes (D2, D2, F2, D2, A2, G2, F2, E2)
    const cyberNotes  = [73.42, 73.42, 87.31, 73.42, 110.00, 98.00, 87.31, 82.41];

    this.bgmStep = 0;
    const intervalMs = this.activeTheme === 'cyber' ? 260 : 380;

    this.bgmTimer = setInterval(() => {
      if (!this.ctx || this.isMuted || this.ctx.state !== 'running') return;

      try {
        const notes = this.activeTheme === 'cyber' ? cyberNotes : gardenNotes;
        const freq = notes[this.bgmStep % notes.length];
        this.bgmStep++;

        const t0 = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        if (this.activeTheme === 'cyber') {
          // Filtered sawtooth cyber pulse
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(500, t0);
          filter.Q.setValueAtTime(3, t0);

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t0);

          gain.gain.setValueAtTime(0.09, t0);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);

          osc.connect(filter);
          filter.connect(gain);
        } else {
          // Soft sine / triangle garden chime
          osc.type = (this.bgmStep % 2 === 0) ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, t0);

          gain.gain.setValueAtTime(0.07, t0);
          gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);

          osc.connect(gain);
        }

        gain.connect(this.bgmGain || this.masterGain);
        osc.start(t0);
        osc.stop(t0 + 0.35);
      } catch {
        // Non-blocking safeguard
      }
    }, intervalMs);
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  pauseBgm() {
    this.stopBgm();
  }

  resumeBgm(theme) {
    if (!this.isMuted) {
      this.startBgm(theme || this.activeTheme);
    }
  }

  updateTheme(theme) {
    this.activeTheme = theme;
    if (this.bgmTimer && !this.isMuted) {
      this.startBgm(theme);
    }
  }
}

/**
 * ==========================================================================
 * 4. Game Controller (DOM, Sound, and User Inputs)
 * ==========================================================================
 */
class GameController {
  constructor() {
    this.engine = new SnakeEngine();
    this.canvas2D = document.getElementById('snake-canvas');
    this.canvas3D = document.getElementById('three-canvas');
    this.renderer2D = new SnakeRenderer(this.canvas2D);
    this.renderer3D = new Snake3DRenderer(this.canvas3D);

    // View Mode Management (2D Canvas default vs Three.js 3D)
    this.viewMode = this.loadSavedViewMode();
    this.viewToggleBtn = document.getElementById('view-toggle');
    this.viewToggleIcon = document.getElementById('view-toggle-icon');
    this.viewToggleLabel = document.getElementById('view-toggle-label');

    // Sound Management
    this.soundEngine = new SoundEngine();
    this.soundToggleBtn = document.getElementById('sound-toggle');
    this.soundToggleIcon = document.getElementById('sound-toggle-icon');
    this.soundToggleLabel = document.getElementById('sound-toggle-label');

    // Theme Management
    this.theme = this.loadSavedTheme();
    this.themeToggleBtn = document.getElementById('theme-toggle');
    this.themeToggleIcon = document.getElementById('theme-toggle-icon');
    this.themeToggleLabel = document.getElementById('theme-toggle-label');

    // DOM UI Elements
    this.brandTagEl = document.getElementById('brand-tag');
    this.scoreLabelEl = document.getElementById('score-label');
    this.bestLabelEl = document.getElementById('best-label');
    this.scoreValEl = document.getElementById('score-val');
    this.bestScoreValEl = document.getElementById('best-score-val');
    this.stateIndicatorEl = document.getElementById('game-state-indicator');

    this.overlayEl = document.getElementById('lcd-message-overlay');
    this.overlayTitleEl = document.getElementById('overlay-title');
    this.overlaySubEl = document.getElementById('overlay-sub');

    // Controls
    this.btnStartPause = document.getElementById('btn-start-pause');
    this.btnReset = document.getElementById('btn-reset');
    this.btnUp = document.getElementById('btn-up');
    this.btnDown = document.getElementById('btn-down');
    this.btnLeft = document.getElementById('btn-left');
    this.btnRight = document.getElementById('btn-right');

    this.guidanceTitleEl = document.getElementById('guidance-title');
    this.guidanceTipEl = document.getElementById('guidance-tip');

    this.timerId = null;

    this.init();
  }

  init() {
    this.bindEvents();
    this.applyTheme();
    this.updateSoundToggleUI();
    this.setViewMode(this.viewMode);
    this.updateUI();
    this.renderActiveView();
  }

  /**
   * Loads saved view mode from storage, validating 3D support.
   */
  loadSavedViewMode() {
    try {
      const saved = localStorage.getItem(CONFIG.VIEW_STORAGE_KEY);
      if (saved === '3d' && this.renderer3D && this.renderer3D.isSupported) {
        return '3d';
      }
      return '2d';
    } catch {
      return '2d';
    }
  }

  /**
   * Switches active rendering pipeline between 2D Canvas and Three.js 3D WebGL.
   */
  setViewMode(mode) {
    if (mode === '3d' && (!this.renderer3D || !this.renderer3D.isSupported)) {
      mode = '2d';
    }
    this.viewMode = mode;
    try {
      localStorage.setItem(CONFIG.VIEW_STORAGE_KEY, this.viewMode);
    } catch {
      // Storage blocked
    }

    const is3D = this.viewMode === '3d';
    if (this.canvas2D) this.canvas2D.classList.toggle('hidden', is3D);
    if (this.canvas3D) this.canvas3D.classList.toggle('hidden', !is3D);

    if (is3D) {
      this.renderer3D.updateTheme(this.getThemeConfig());
      this.renderer3D.render(this.engine, this.getThemeConfig());
      this.renderer3D.startLoop();
    } else {
      if (this.renderer3D) this.renderer3D.stopLoop();
      this.renderer2D.render(this.engine, this.getThemeConfig());
    }

    this.updateViewToggleUI();
  }

  /**
   * Toggles view mode between 2D and 3D with audio feedback.
   */
  toggleViewMode() {
    if (!this.renderer3D || !this.renderer3D.isSupported) return;
    this.soundEngine.playButton();
    const nextMode = this.viewMode === '2d' ? '3d' : '2d';
    this.setViewMode(nextMode);
  }

  /**
   * Updates View Toggle switch button state and accessible labels.
   */
  updateViewToggleUI() {
    if (!this.viewToggleBtn) return;
    if (!this.renderer3D || !this.renderer3D.isSupported) {
      this.viewToggleBtn.disabled = true;
      this.viewToggleBtn.setAttribute('aria-checked', 'false');
      if (this.viewToggleLabel) this.viewToggleLabel.textContent = '2D Only';
      return;
    }
    const is3D = this.viewMode === '3d';
    this.viewToggleBtn.disabled = false;
    this.viewToggleBtn.setAttribute('aria-checked', is3D ? 'true' : 'false');
    this.viewToggleBtn.setAttribute('aria-label', is3D ? 'Switch to 2D view' : 'Switch to 3D view');
    if (this.viewToggleIcon) this.viewToggleIcon.textContent = is3D ? '🧊' : '🎮';
    if (this.viewToggleLabel) this.viewToggleLabel.textContent = is3D ? '3D View' : '2D View';
  }

  /**
   * Draws using whichever renderer is currently active.
   */
  renderActiveView() {
    const t = this.getThemeConfig();
    if (this.viewMode === '3d' && this.renderer3D && this.renderer3D.isSupported) {
      this.renderer3D.render(this.engine, t);
    } else {
      this.renderer2D.render(this.engine, t);
    }
  }

  /**
   * Syncs DOM Sound Switcher button with current sound engine mute state.
   */
  updateSoundToggleUI() {
    if (!this.soundToggleBtn) return;
    const isMuted = this.soundEngine.isMuted;
    this.soundToggleBtn.setAttribute('aria-checked', isMuted ? 'false' : 'true');
    this.soundToggleBtn.setAttribute('aria-label', isMuted ? 'Unmute sound' : 'Mute sound');
    if (this.soundToggleIcon) {
      this.soundToggleIcon.textContent = isMuted ? '🔇' : '🔊';
    }
    if (this.soundToggleLabel) {
      this.soundToggleLabel.textContent = isMuted ? 'Muted' : 'Sound';
    }
  }

  /**
   * Toggles mute on/off and synchronizes active background loop.
   */
  toggleSound() {
    const isMuted = this.soundEngine.toggleMute();
    this.updateSoundToggleUI();
    if (!isMuted && this.engine.status === 'RUNNING') {
      this.soundEngine.startBgm(this.theme);
    }
  }

  /**
   * Loads user's preferred theme from localStorage or defaults to garden.
   */
  loadSavedTheme() {
    try {
      const saved = localStorage.getItem(CONFIG.THEME_STORAGE_KEY);
      return (saved === 'cyber' || saved === 'garden') ? saved : 'garden';
    } catch {
      return 'garden';
    }
  }

  /**
   * Returns active theme configuration dictionary.
   */
  getThemeConfig() {
    return CONFIG.THEMES[this.theme] || CONFIG.THEMES.garden;
  }

  /**
   * Toggles between Garden (Light) and Cyber (Dark) themes.
   */
  toggleTheme() {
    const nextTheme = (this.theme === 'garden') ? 'cyber' : 'garden';
    this.soundEngine.playButton();
    this.setTheme(nextTheme);
  }

  /**
   * Applies the requested theme, updates DOM tokens and re-renders playfield.
   */
  setTheme(themeId) {
    if (!CONFIG.THEMES[themeId]) return;
    this.theme = themeId;
    try {
      localStorage.setItem(CONFIG.THEME_STORAGE_KEY, themeId);
    } catch {
      // Storage unavailable or disabled
    }
    this.soundEngine.updateTheme(themeId);
    this.applyTheme();
  }

  /**
   * Updates CSS classes, HUD copy, accessibility attributes, and canvas visuals.
   */
  applyTheme() {
    const t = this.getThemeConfig();

    // 1. Update body class and document title
    document.body.className = t.bodyClass;
    document.title = t.title;

    // 2. Update Theme Switcher Button
    if (this.themeToggleBtn) {
      this.themeToggleBtn.setAttribute('aria-checked', this.theme === 'cyber' ? 'true' : 'false');
      if (this.themeToggleIcon) this.themeToggleIcon.textContent = t.icon;
      if (this.themeToggleLabel) this.themeToggleLabel.textContent = t.toggleLabel;
    }

    // 3. Update Brand Tag and Scorecard Labels
    if (this.brandTagEl) this.brandTagEl.textContent = t.brandTag;
    if (this.scoreLabelEl) this.scoreLabelEl.textContent = t.scoreLabel;
    if (this.bestLabelEl) this.bestLabelEl.textContent = t.bestLabel;

    // 4. Update Reset Button Label
    if (this.btnReset) {
      const resetLabel = this.btnReset.querySelector('.btn-label');
      if (resetLabel) resetLabel.textContent = t.btnReset;
    }

    // 5. Update Guidance Panel Copy
    if (this.guidanceTitleEl) this.guidanceTitleEl.textContent = t.guidanceTitle;
    if (this.guidanceTipEl) this.guidanceTipEl.innerHTML = t.guidanceTip;

    // 6. Update overlay copy if visible
    if (!this.overlayEl.classList.contains('hidden')) {
      if (this.engine.status === 'READY') {
        this.showOverlay(t.overlayReadyTitle, t.overlayReadySub);
      } else if (this.engine.status === 'PAUSED') {
        this.showOverlay(t.overlayPausedTitle, t.overlayPausedSub);
      }
    }

    // 7. Update button state labels and redraw canvas
    this.updateUI();
    if (this.renderer3D && this.renderer3D.isSupported) {
      this.renderer3D.updateTheme(t);
    }
    this.renderActiveView();
  }

  /**
   * Binds keyboard and button events.
   */
  bindEvents() {
    // Global user gesture unlock for Web Audio (strict autoplay policy compliance)
    const unlockAudio = () => {
      this.soundEngine.initOnUserGesture();
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    // Sound toggle button
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => this.toggleSound());
    }

    // View mode toggle button (2D / 3D)
    if (this.viewToggleBtn) {
      this.viewToggleBtn.addEventListener('click', () => this.toggleViewMode());
    }

    // Theme toggle button
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Window resize handler for 3D camera aspect ratio
    window.addEventListener('resize', () => {
      if (this.renderer3D && this.renderer3D.isSupported) {
        this.renderer3D.handleResize();
      }
    });

    // Keyboard inputs
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Directional On-Screen Buttons (D-Pad)
    this.btnUp.addEventListener('click', () => this.handleDirectionInput(DIRECTIONS.UP));
    this.btnDown.addEventListener('click', () => this.handleDirectionInput(DIRECTIONS.DOWN));
    this.btnLeft.addEventListener('click', () => this.handleDirectionInput(DIRECTIONS.LEFT));
    this.btnRight.addEventListener('click', () => this.handleDirectionInput(DIRECTIONS.RIGHT));

    // Softkeys
    this.btnStartPause.addEventListener('click', () => this.toggleStartPause());
    this.btnReset.addEventListener('click', () => this.resetGame());
  }

  /**
   * Keyboard controller handler.
   */
  handleKeyDown(e) {
    // Allow Space or Enter to activate focused buttons (e.g. Theme Toggle)
    if (e.target && e.target.tagName === 'BUTTON' && (e.code === 'Space' || e.code === 'Enter')) {
      return;
    }

    // Prevent default scroll behavior for game navigation keys
    const handledKeys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'KeyW', 'KeyS', 'KeyA', 'KeyD',
      'Space', 'KeyP', 'KeyR', 'KeyM', 'KeyV'
    ];

    if (handledKeys.includes(e.code)) {
      e.preventDefault();
    }

    switch (e.code) {
      // Directional controls: Arrows + WASD
      case 'ArrowUp':
      case 'KeyW':
        this.handleDirectionInput(DIRECTIONS.UP);
        break;

      case 'ArrowDown':
      case 'KeyS':
        this.handleDirectionInput(DIRECTIONS.DOWN);
        break;

      case 'ArrowLeft':
      case 'KeyA':
        this.handleDirectionInput(DIRECTIONS.LEFT);
        break;

      case 'ArrowRight':
      case 'KeyD':
        this.handleDirectionInput(DIRECTIONS.RIGHT);
        break;

      // Start / Pause
      case 'Space':
      case 'KeyP':
        this.toggleStartPause();
        break;

      // Reset
      case 'KeyR':
        this.resetGame();
        break;

      // Mute / Unmute shortcut
      case 'KeyM':
        this.toggleSound();
        break;

      // View Mode Toggle (2D / 3D) shortcut
      case 'KeyV':
        this.toggleViewMode();
        break;

      case 'Enter':
        if (this.engine.status === 'GAME_OVER') {
          this.resetGame();
          this.startGame();
        } else if (this.engine.status === 'READY') {
          this.startGame();
        }
        break;
    }
  }

  /**
   * Direction inputs from keyboard or on-screen buttons.
   */
  handleDirectionInput(dir) {
    if (this.engine.status === 'READY') {
      this.startGame();
      this.engine.setDirection(dir);
    } else if (this.engine.status === 'RUNNING') {
      const changed = this.engine.direction.name !== dir.name;
      if (this.engine.setDirection(dir) && changed) {
        this.soundEngine.playTurn(this.theme);
      }
    }
  }

  /**
   * Start / Pause toggle handler.
   */
  toggleStartPause() {
    if (this.engine.status === 'READY') {
      this.startGame();
    } else if (this.engine.status === 'RUNNING') {
      this.pauseGame();
    } else if (this.engine.status === 'PAUSED') {
      this.resumeGame();
    } else if (this.engine.status === 'GAME_OVER') {
      this.resetGame();
      this.startGame();
    }
  }

  startGame() {
    this.engine.status = 'RUNNING';
    this.hideOverlay();
    this.updateUI();
    this.startLoop();
    this.soundEngine.playStart(this.theme);
    this.soundEngine.startBgm(this.theme);
  }

  pauseGame() {
    const t = this.getThemeConfig();
    this.engine.status = 'PAUSED';
    this.stopLoop();
    this.showOverlay(t.overlayPausedTitle, t.overlayPausedSub);
    this.updateUI();
    this.soundEngine.pauseBgm();
  }

  resumeGame() {
    this.engine.status = 'RUNNING';
    this.hideOverlay();
    this.updateUI();
    this.startLoop();
    this.soundEngine.playStart(this.theme);
    this.soundEngine.resumeBgm(this.theme);
  }

  resetGame() {
    const t = this.getThemeConfig();
    this.stopLoop();
    this.engine.reset();
    this.showOverlay(t.overlayReadyTitle, t.overlayReadySub);
    this.updateUI();
    this.renderActiveView();
    this.soundEngine.stopBgm();
    this.soundEngine.playButton();
  }

  startLoop() {
    this.stopLoop();
    this.timerId = setInterval(() => this.tick(), CONFIG.TICK_INTERVAL_MS);
  }

  stopLoop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Main game tick executed on interval.
   */
  tick() {
    const result = this.engine.step();

    if (result.ateFood) {
      this.soundEngine.playEat(this.theme);
    }

    if (result.gameOver) {
      this.stopLoop();
      this.handleGameOver(result);
    }

    this.updateUI();
    this.renderActiveView();
  }

  /**
   * Handles visual feedback on game over using active theme copy.
   */
  handleGameOver(result) {
    const t = this.getThemeConfig();
    const reasonText = result.reason === 'WALL' ? t.reasonWall : t.reasonSelf;
    const title = result.won ? t.overlayWinTitle : t.overlayLoseTitle;
    const subText = result.won
      ? `${t.overlayWinSub}${this.engine.score}`
      : `${reasonText} • ${t.scoreLabel}: ${this.engine.score}`;

    this.showOverlay(title, `${subText}\n${t.overlayRestartHint}`);
    this.updateUI();
    this.soundEngine.stopBgm();
    this.soundEngine.playGameOver(this.theme);
  }

  showOverlay(title, subtitle) {
    this.overlayTitleEl.textContent = title;
    this.overlaySubEl.innerText = subtitle;
    this.overlayEl.classList.remove('hidden');
  }

  hideOverlay() {
    this.overlayEl.classList.add('hidden');
  }

  /**
   * Syncs DOM HUD and button labels with current engine state and theme.
   */
  updateUI() {
    const t = this.getThemeConfig();
    this.scoreValEl.textContent = this.engine.score;
    this.bestScoreValEl.textContent = this.engine.bestScore;
    this.stateIndicatorEl.textContent = this.engine.status;

    // Update Start/Pause button label based on engine state and theme
    const btnLabelEl = this.btnStartPause.querySelector('.btn-label');
    if (btnLabelEl) {
      if (this.engine.status === 'RUNNING') {
        btnLabelEl.textContent = t.btnPause;
      } else if (this.engine.status === 'PAUSED') {
        btnLabelEl.textContent = t.btnResume;
      } else {
        btnLabelEl.textContent = t.btnStart;
      }
    }
  }
}

// ==========================================
// Initialize Game on DOM ready & Register PWA Service Worker
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  new GameController();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Offline support gracefully unavailable (e.g. running via file:// protocol)
    });
  }
});

