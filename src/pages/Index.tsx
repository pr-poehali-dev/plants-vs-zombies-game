import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { sounds } from '@/utils/sounds';

type Page = 'home' | 'game' | 'levels' | 'leaderboard' | 'profile' | 'rules' | 'shop' | 'auth';
type Tool = 'plant' | 'shovel' | 'glove' | null;
type GameMode = '2d' | '3d';

interface Player {
  id: number;
  name: string;
  rating: number;
  wins: number;
  level: number;
}

interface PlantType {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  damage: number;
  hp?: number;
  shootRate?: number;
  cooldown?: number;
}

interface PlantCooldown {
  plantId: string;
  readyAt: number;
}

interface ZombieType {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  speed: number;
}

interface PlacedPlant {
  id: string;
  type: string;
  row: number;
  col: number;
  hp: number;
  lastShot: number;
  lastSunGeneration?: number;
}

interface ActiveZombie {
  id: string;
  type: string;
  row: number;
  position: number;
  hp: number;
  isEating: boolean;
}

interface FallingSun {
  id: string;
  row: number;
  col: number;
  isCollected: boolean;
  value: number;
  isBig: boolean;
}

interface Projectile {
  id: string;
  row: number;
  position: number;
  damage: number;
}

const allPlants: PlantType[] = [
  { id: 'sunflower', name: 'Подсолнух', emoji: '🌻', cost: 50, damage: 0, hp: 100, cooldown: 7500 },
  { id: 'peashooter', name: 'Горохострел', emoji: '🌱', cost: 100, damage: 20, hp: 100, shootRate: 1350, cooldown: 7500 },
  { id: 'wallnut', name: 'Орех', emoji: '🥜', cost: 150, damage: 0, hp: 400, cooldown: 30000 },
  { id: 'cactus', name: 'Кактус', emoji: '🌵', cost: 200, damage: 30, hp: 150, shootRate: 1200, cooldown: 7500 },
  { id: 'repeater', name: 'Повторитель', emoji: '🌿', cost: 200, damage: 20, hp: 100, shootRate: 700, cooldown: 7500 },
  { id: 'chomper', name: 'Кусака', emoji: '🪴', cost: 150, damage: 100, hp: 150, shootRate: 3000, cooldown: 7500 },
  { id: 'iceshooter', name: 'Ледострел', emoji: '❄️', cost: 175, damage: 15, hp: 100, shootRate: 1400, cooldown: 7500 },
  { id: 'tallnut', name: 'Большой орех', emoji: '🌰', cost: 250, damage: 0, hp: 800, cooldown: 30000 },
  { id: 'potatomine', name: 'Картофельная мина', emoji: '🥔', cost: 25, damage: 200, hp: 100, cooldown: 30000 },
  { id: 'squash', name: 'Тыква', emoji: '🎃', cost: 50, damage: 300, hp: 100, cooldown: 30000 },
];

const zombieTypes: ZombieType[] = [
  { id: 'basic', name: 'Обычный', emoji: '🧟', hp: 100, speed: 0.3 },
  { id: 'cone', name: 'С конусом', emoji: '🚧', hp: 250, speed: 0.28 },
  { id: 'bucket', name: 'С ведром', emoji: '🪣', hp: 400, speed: 0.25 },
  { id: 'pole', name: 'С шестом', emoji: '🧟‍♂️', hp: 150, speed: 0.5 },
];

const mockPlayers: Player[] = [
  { id: 1, name: 'PlantMaster', rating: 2450, wins: 128, level: 15 },
  { id: 2, name: 'ZombieSlayer', rating: 2380, wins: 115, level: 14 },
  { id: 3, name: 'GreenThumb', rating: 2290, wins: 98, level: 13 },
  { id: 4, name: 'DefendPro', rating: 2180, wins: 87, level: 12 },
  { id: 5, name: 'SunCollector', rating: 2090, wins: 76, level: 11 },
];

export default function Index() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [sun, setSun] = useState(150);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [placedPlants, setPlacedPlants] = useState<PlacedPlant[]>([]);
  const [zombies, setZombies] = useState<ActiveZombie[]>([]);
  const [fallingSuns, setFallingSuns] = useState<FallingSun[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [gameRunning, setGameRunning] = useState(false);
  const [wave, setWave] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState(1);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [zombiesKilled, setZombiesKilled] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool>('plant');
  const [plantCooldowns, setPlantCooldowns] = useState<PlantCooldown[]>([]);
  const [coins, setCoins] = useState(0);
  const [username, setUsername] = useState<string | null>(localStorage.getItem('pvz_username'));
  const [draggedPlant, setDraggedPlant] = useState<PlacedPlant | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('2d');
  const [gloveCooldown, setGloveCooldown] = useState<number>(0);

  const spawnZombie = useCallback(() => {
    if (!gameRunning || gameOver) return;
    
    const row = Math.floor(Math.random() * 5);
    const rand = Math.random();
    let type = 'basic';
    
    if (currentLevel >= 5 && rand > 0.85) {
      type = 'bucket';
    } else if (currentLevel >= 4 && rand > 0.7) {
      type = 'pole';
    } else if (currentLevel >= 2 && rand > 0.5) {
      type = 'cone';
    }
    
    const zombieType = zombieTypes.find(z => z.id === type)!;
    
    const newZombie: ActiveZombie = {
      id: `zombie-${Date.now()}-${Math.random()}`,
      type,
      row,
      position: 9,
      hp: zombieType.hp,
      isEating: false,
    };
    
    setZombies(prev => [...prev, newZombie]);
  }, [gameRunning, gameOver, currentLevel]);

  const spawnFallingSun = useCallback(() => {
    if (!gameRunning || gameOver) return;
    
    const row = Math.floor(Math.random() * 5);
    const col = Math.floor(Math.random() * 9);
    const isBig = Math.random() < 0.25;
    
    const newSun: FallingSun = {
      id: `sun-${Date.now()}-${Math.random()}`,
      row,
      col,
      isCollected: false,
      value: isBig ? 50 : 25,
      isBig,
    };
    
    setFallingSuns(prev => [...prev, newSun]);
    
    setTimeout(() => {
      setFallingSuns(prev => prev.filter(s => s.id !== newSun.id));
    }, 7000);
  }, [gameRunning, gameOver]);

  const getAvailablePlants = useCallback(() => {
    return allPlants.slice(0, Math.min(2 + currentLevel, allPlants.length));
  }, [currentLevel]);

  useEffect(() => {
    if (!gameRunning || gameOver) return;

    const zombieSpawner = setInterval(() => {
      if (Math.random() > 0.5) {
        spawnZombie();
      }
    }, 4000);

    const scheduleNextSun = () => {
      const delay = 5000 + Math.random() * 3000;
      setTimeout(() => {
        if (gameRunning && !gameOver) {
          spawnFallingSun();
          scheduleNextSun();
        }
      }, delay);
    };
    
    scheduleNextSun();

    return () => {
      clearInterval(zombieSpawner);
    };
  }, [gameRunning, gameOver, spawnZombie, spawnFallingSun]);

  useEffect(() => {
    if (!gameRunning || gameOver || levelCompleted) return;

    const gameLoop = setInterval(() => {
      const now = Date.now();

      setZombies(prevZombies => {
        const updatedZombies = prevZombies.map(zombie => {
          const plantsInRow = placedPlants.filter(p => p.row === zombie.row && p.col >= zombie.position - 1);
          
          if (plantsInRow.length > 0 && zombie.position <= plantsInRow[0].col + 1) {
            return { ...zombie, isEating: true };
          }

          if (!zombie.isEating) {
            const zombieType = zombieTypes.find(z => z.id === zombie.type)!;
            const newPosition = zombie.position - zombieType.speed * 0.1;
            
            if (newPosition <= 0) {
              setGameOver(true);
              setGameRunning(false);
              sounds.lose();
              return zombie;
            }
            
            return { ...zombie, position: newPosition };
          }
          
          return zombie;
        });

        if (zombiesKilled >= 20 && updatedZombies.length === 0 && gameRunning) {
          setLevelCompleted(true);
          setGameRunning(false);
          setMaxUnlockedLevel(prev => Math.max(prev, currentLevel + 1));
          setCoins(prev => prev + 100 + currentLevel * 10);
          sounds.win();
        }

        return updatedZombies;
      });

      setPlacedPlants(prevPlants => {
        return prevPlants.map(plant => {
          const zombiesInRow = zombies.filter(z => z.row === plant.row && z.position <= plant.col + 1 && z.position >= plant.col - 0.5);
          
          if (zombiesInRow.length > 0) {
            return { ...plant, hp: plant.hp - 5 };
          }

          if (plant.type === 'sunflower') {
            if (!plant.lastSunGeneration || now - plant.lastSunGeneration > 9000) {
              setSun(prev => prev + 25);
              return { ...plant, lastSunGeneration: now };
            }
          }

          const plantType = allPlants.find(p => p.id === plant.type)!;
          if (plantType.damage > 0 && plantType.shootRate) {
            if (!plant.lastShot || now - plant.lastShot > plantType.shootRate) {
              const zombiesInLane = zombies.filter(z => z.row === plant.row && z.position > plant.col);
              
              if (zombiesInLane.length > 0) {
                const newProjectile: Projectile = {
                  id: `proj-${Date.now()}-${Math.random()}`,
                  row: plant.row,
                  position: plant.col + 1,
                  damage: plantType.damage,
                };
                
                setProjectiles(prev => [...prev, newProjectile]);
                return { ...plant, lastShot: now };
              }
            }
          }

          return plant;
        }).filter(plant => plant.hp > 0);
      });

      setProjectiles(prevProjectiles => {
        const updatedProjectiles = prevProjectiles.map(proj => ({
          ...proj,
          position: proj.position + 0.3,
        })).filter(proj => proj.position < 10);

        updatedProjectiles.forEach(proj => {
          const hitZombies = zombies.filter(
            z => z.row === proj.row && 
            Math.abs(z.position - proj.position) < 0.5
          );

          if (hitZombies.length > 0) {
            setZombies(prevZombies => {
              return prevZombies.map(z => {
                if (hitZombies.some(hz => hz.id === z.id)) {
                  const newHp = z.hp - proj.damage;
                  if (newHp <= 0) {
                    setZombiesKilled(prev => prev + 1);
                  }
                  return { ...z, hp: newHp };
                }
                return z;
              }).filter(z => z.hp > 0);
            });

            setProjectiles(prev => prev.filter(p => p.id !== proj.id));
          }
        });

        return updatedProjectiles;
      });

    }, 100);

    return () => clearInterval(gameLoop);
  }, [gameRunning, gameOver, levelCompleted, placedPlants, zombies, zombiesKilled, currentLevel]);

  const handleCellClick = (row: number, col: number) => {
    if (!gameRunning) return;

    const plantExists = placedPlants.find(p => p.row === row && p.col === col);

    if (selectedTool === 'shovel' && plantExists) {
      setPlacedPlants(prev => prev.filter(p => p.id !== plantExists.id));
      setSelectedTool('plant');
      sounds.shovel();
      return;
    }

    if (selectedTool === 'glove' && plantExists) {
      if (gloveCooldown > Date.now()) return;
      setDraggedPlant(plantExists);
      setPlacedPlants(prev => prev.filter(p => p.id !== plantExists.id));
      return;
    }

    if (selectedTool === 'glove' && draggedPlant && !plantExists) {
      const movedPlant = { ...draggedPlant, row, col, id: `plant-${Date.now()}` };
      setPlacedPlants(prev => [...prev, movedPlant]);
      setDraggedPlant(null);
      setSelectedTool('plant');
      setGloveCooldown(Date.now() + 5000);
      return;
    }

    if (selectedTool === 'plant' && selectedPlant && !plantExists) {
      const plantType = allPlants.find(p => p.id === selectedPlant);
      if (!plantType || sun < plantType.cost) return;

      const cooldown = plantCooldowns.find(c => c.plantId === selectedPlant);
      if (cooldown && Date.now() < cooldown.readyAt) return;

      const newPlant: PlacedPlant = {
        id: `plant-${Date.now()}`,
        type: selectedPlant,
        row,
        col,
        hp: plantType.hp || 100,
        lastShot: 0,
        lastSunGeneration: plantType.id === 'sunflower' ? Date.now() : undefined,
      };

      setPlacedPlants(prev => [...prev, newPlant]);
      setSun(prev => prev - plantType.cost);
      sounds.plant();
      
      if (plantType.cooldown) {
        setPlantCooldowns(prev => [
          ...prev.filter(c => c.plantId !== selectedPlant),
          { plantId: selectedPlant, readyAt: Date.now() + plantType.cooldown }
        ]);
      }
      
      setSelectedPlant(null);
    }
  };

  const handleSunClick = (sun: FallingSun) => {
    setFallingSuns(prev => prev.filter(s => s.id !== sun.id));
    setSun(prev => prev + sun.value);
    sounds.sunCollect();
  };

  const startGame = (level?: number) => {
    setGameRunning(true);
    setGameOver(false);
    setLevelCompleted(false);
    setPlacedPlants([]);
    setZombies([]);
    setFallingSuns([]);
    setProjectiles([]);
    setSun(150);
    setZombiesKilled(0);
    setWave(1);
    if (level) setCurrentLevel(level);
  };

  const renderHome = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-16 animate-fade-in">
        <div className="text-8xl mb-6 animate-bounce">🌻🧟</div>
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Plants vs Zombies
        </h1>
        <p className="text-xl text-muted-foreground mb-8">Многопользовательская битва онлайн</p>
        <Button 
          size="lg" 
          className="text-lg px-12 py-6 bg-primary hover:bg-primary/90 transition-all hover:scale-105"
          onClick={() => {
            startGame(1);
            setCurrentPage('game');
          }}
        >
          <Icon name="Play" className="mr-2" size={24} />
          Начать игру
        </Button>
        
        <div className="mt-8 flex gap-4 justify-center">
          <Card
            className={`p-6 cursor-pointer transition-all hover:scale-105 border-2 ${
              gameMode === '2d' ? 'border-primary ring-2 ring-primary' : 'border-border'
            }`}
            onClick={() => setGameMode('2d')}
          >
            <div className="text-4xl mb-2 text-center">🎮</div>
            <p className="font-bold text-center">2D режим</p>
            <p className="text-xs text-muted-foreground text-center mt-1">Классический</p>
          </Card>
          <Card
            className={`p-6 cursor-pointer transition-all hover:scale-105 border-2 ${
              gameMode === '3d' ? 'border-primary ring-2 ring-primary' : 'border-border'
            }`}
            onClick={() => setGameMode('3d')}
          >
            <div className="text-4xl mb-2 text-center">🕶️</div>
            <p className="font-bold text-center">3D режим</p>
            <p className="text-xs text-muted-foreground text-center mt-1">С перспективой</p>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 max-w-5xl w-full">
        {[
          { icon: 'Gamepad2', label: 'Игра', page: 'game' as Page },
          { icon: 'Trophy', label: 'Рейтинг', page: 'leaderboard' as Page },
          { icon: 'Map', label: 'Уровни', page: 'levels' as Page },
          { icon: 'ShoppingCart', label: 'Магазин', page: 'shop' as Page },
          { icon: 'User', label: 'Профиль', page: 'profile' as Page },
          { icon: 'BookOpen', label: 'Правила', page: 'rules' as Page },
        ].map((item, idx) => (
          <Card
            key={item.page}
            className="p-6 text-center cursor-pointer hover:bg-card/80 transition-all hover:scale-105 border-2 border-border"
            onClick={() => setCurrentPage(item.page)}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <Icon name={item.icon as any} size={32} className="mx-auto mb-2 text-primary" />
            <p className="font-medium">{item.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGame = () => (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => setCurrentPage('home')}>
            <Icon name="ArrowLeft" className="mr-2" size={20} />
            Назад
          </Button>
          <div className="flex items-center gap-4">
            {!gameRunning && !gameOver && (
              <Button onClick={startGame} className="bg-primary">
                <Icon name="Play" className="mr-2" size={20} />
                Старт
              </Button>
            )}
            {gameRunning && (
              <Button onClick={() => setGameRunning(false)} variant="destructive">
                <Icon name="Pause" className="mr-2" size={20} />
                Пауза
              </Button>
            )}
            <Badge className="text-lg px-6 py-2 bg-yellow-500 text-black">
              <Icon name="Sun" className="mr-2" size={20} />
              {sun} солнца
            </Badge>
            <Badge variant="outline" className="text-lg px-6 py-2">
              <Icon name="Coins" className="mr-2" size={20} />
              {coins} монет
            </Badge>
            <Badge variant="outline" className="text-lg px-6 py-2">
              {currentLevel > 20 ? '🌙' : '☀️'} Уровень {currentLevel}
            </Badge>
          </div>
        </div>

        {gameOver && !levelCompleted && (
          <Card className="p-8 mb-6 text-center border-destructive border-2">
            <h2 className="text-4xl font-bold mb-4 text-destructive">Игра окончена!</h2>
            <p className="text-xl mb-4">Зомби добрались до вашего дома!</p>
            <p className="text-muted-foreground mb-6">Убито зомби: {zombiesKilled}</p>
            <Button onClick={() => startGame(currentLevel)} size="lg" className="bg-primary">
              <Icon name="RotateCcw" className="mr-2" size={20} />
              Начать заново
            </Button>
          </Card>
        )}

        {levelCompleted && (
          <Card className="p-8 mb-6 text-center border-primary border-2 bg-primary/10">
            <h2 className="text-4xl font-bold mb-4 text-primary">🎉 Уровень пройден!</h2>
            <p className="text-xl mb-4">Поздравляем! Вы защитили дом от зомби!</p>
            <p className="text-muted-foreground mb-6">Убито зомби: {zombiesKilled}</p>
            <div className="flex gap-4 justify-center">
              {currentLevel < 41 && (
                <Button onClick={() => {
                  const nextLevel = currentLevel + 1;
                  setMaxUnlockedLevel(Math.max(maxUnlockedLevel, nextLevel));
                  startGame(nextLevel);
                }} size="lg" className="bg-primary">
                  <Icon name="ArrowRight" className="mr-2" size={20} />
                  Следующий уровень
                </Button>
              )}
              <Button onClick={() => setCurrentPage('levels')} size="lg" variant="outline">
                <Icon name="Map" className="mr-2" size={20} />
                Выбор уровня
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-4 mb-4 border-2 border-primary">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🧟</span>
            <div className="flex-1">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Прогресс волны</span>
                <span className="text-sm font-bold text-primary">{zombiesKilled} / 20</span>
              </div>
              <div className="relative w-full h-6 bg-border rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                  style={{ width: `${(zombiesKilled / 20) * 100}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 text-2xl transition-all duration-300"
                  style={{ left: `${Math.min((zombiesKilled / 20) * 100, 95)}%` }}
                >
                  🧟
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-4 mb-4">
          <Card
            className={`p-4 cursor-pointer transition-all hover:scale-105 border-2 ${
              selectedTool === 'shovel' ? 'border-destructive ring-2 ring-destructive' : 'border-border'
            }`}
            onClick={() => setSelectedTool(selectedTool === 'shovel' ? 'plant' : 'shovel')}
          >
            <div className="text-4xl text-center">🪓</div>
            <p className="text-center text-xs mt-1">Лопата</p>
          </Card>
          <Card
            className={`p-4 cursor-pointer transition-all hover:scale-105 border-2 relative overflow-hidden ${
              selectedTool === 'glove' ? 'border-secondary ring-2 ring-secondary' : 'border-border'
            } ${gloveCooldown > Date.now() ? 'opacity-50' : ''}`}
            onClick={() => {
              if (gloveCooldown <= Date.now()) {
                setSelectedTool(selectedTool === 'glove' ? 'plant' : 'glove');
              }
            }}
          >
            {gloveCooldown > Date.now() && (
              <div 
                className="absolute bottom-0 left-0 right-0 bg-muted transition-all"
                style={{ height: `${((gloveCooldown - Date.now()) / 5000) * 100}%` }}
              />
            )}
            <div className="text-4xl text-center relative z-10">🧤</div>
            <p className="text-center text-xs mt-1 relative z-10">Перчатка</p>
          </Card>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          {getAvailablePlants().map((plant) => {
            const cooldown = plantCooldowns.find(c => c.plantId === plant.id);
            const isOnCooldown = cooldown && Date.now() < cooldown.readyAt;
            const cooldownPercent = isOnCooldown ? ((cooldown!.readyAt - Date.now()) / (plant.cooldown || 1)) * 100 : 0;
            
            return (
              <Card
                key={plant.id}
                className={`p-4 cursor-pointer transition-all hover:scale-105 border-2 relative overflow-hidden ${
                  selectedPlant === plant.id && selectedTool === 'plant' ? 'border-primary ring-2 ring-primary' : 'border-border'
                } ${sun < plant.cost || !gameRunning || isOnCooldown ? 'opacity-50' : ''}`}
                onClick={() => {
                  if (gameRunning && sun >= plant.cost && !isOnCooldown) {
                    setSelectedPlant(plant.id);
                    setSelectedTool('plant');
                  }
                }}
              >
                {isOnCooldown && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-muted transition-all"
                    style={{ height: `${cooldownPercent}%` }}
                  />
                )}
                <div className="text-4xl text-center mb-2 relative z-10">{plant.emoji}</div>
                <p className="text-center font-medium text-sm relative z-10">{plant.name}</p>
                <p className="text-center text-xs text-muted-foreground relative z-10">☀️ {plant.cost}</p>
              </Card>
            );
          })}
        </div>

        <Card className={`p-4 border-2 relative ${
          currentLevel > 20 
            ? 'bg-gradient-to-b from-purple-950/40 to-blue-950/40' 
            : 'bg-gradient-to-b from-green-900/20 to-green-950/20'
        }`}>
          <div className="grid grid-rows-5 gap-2">
            {Array.from({ length: 5 }).map((_, row) => (
              <div key={row} className="grid grid-cols-9 gap-2">
                {Array.from({ length: 9 }).map((_, col) => {
                  const plantHere = placedPlants.find(p => p.row === row && p.col === col);
                  const zombiesHere = zombies.filter(z => z.row === row && Math.floor(z.position) === col);
                  const sunHere = fallingSuns.find(s => s.row === row && s.col === col);
                  const projectilesHere = projectiles.filter(p => p.row === row && Math.floor(p.position) === col);

                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`aspect-square bg-background/30 rounded-lg border-2 border-border/50 transition-all cursor-pointer flex items-center justify-center text-3xl relative ${
                        selectedPlant && !plantHere && gameRunning ? 'hover:bg-primary/20 hover:border-primary' : ''
                      }`}
                      onClick={() => handleCellClick(row, col)}
                      style={{
                        transform: gameMode === '3d' 
                          ? `perspective(1200px) rotateX(${5 + row * 2}deg) rotateY(${col - 4}deg) scale(${1 - row * 0.02})`
                          : 'none',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {plantHere && (
                        <div className="relative animate-pulse">
                          <span className="text-3xl">{allPlants.find(p => p.id === plantHere.type)?.emoji}</span>
                          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-border rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all" 
                              style={{ width: `${(plantHere.hp / (allPlants.find(p => p.id === plantHere.type)?.hp || 100)) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {zombiesHere.map(zombie => (
                        <div key={zombie.id} className="absolute" style={{ animation: zombie.isEating ? 'shake 0.5s infinite' : 'none' }}>
                          <span className="text-3xl">{zombieTypes.find(z => z.id === zombie.type)?.emoji}</span>
                          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-border rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-destructive transition-all" 
                              style={{ width: `${(zombie.hp / (zombieTypes.find(z => z.id === zombie.type)?.hp || 100)) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}

                      {sunHere && (
                        <div 
                          className="absolute cursor-pointer animate-bounce z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSunClick(sunHere);
                          }}
                        >
                          <span className={sunHere.isBig ? 'text-6xl' : 'text-4xl'}>
                            {sunHere.isBig ? '🌟' : '☀️'}
                          </span>
                        </div>
                      )}

                      {projectilesHere.map(proj => (
                        <div key={proj.id} className="absolute">
                          <span className="text-xl">🟢</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Уровень</p>
            <p className="text-2xl font-bold">{currentLevel}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Волна</p>
            <p className="text-2xl font-bold">{wave} / 10</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Убито зомби</p>
            <p className="text-2xl font-bold">{zombiesKilled}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Растений</p>
            <p className="text-2xl font-bold">{placedPlants.length}</p>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderLevels = () => {
    const getLevelEmoji = (level: number) => {
      if (level === 41) return '👑';
      if (level > 20) return '🌙';
      return '☀️';
    };

    const getLevelTitle = (level: number) => {
      if (level === 41) return 'Босс';
      if (level > 20) return 'Ночь';
      return 'День';
    };

    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <Button variant="outline" className="mb-6" onClick={() => setCurrentPage('home')}>
            <Icon name="ArrowLeft" className="mr-2" size={20} />
            Назад
          </Button>
          <h2 className="text-4xl font-bold mb-8">Выбор уровня</h2>
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <span className="text-3xl mr-2">☀️</span>
              День (Уровни 1-20)
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
              {Array.from({ length: 20 }).map((_, idx) => (
                <Card
                  key={idx}
                  className={`p-4 text-center cursor-pointer hover:scale-105 transition-all border-2 ${
                    idx + 1 <= maxUnlockedLevel ? 'border-primary bg-card' : 'border-border opacity-50'
                  }`}
                  onClick={() => {
                    if (idx + 1 <= maxUnlockedLevel) {
                      startGame(idx + 1);
                      setCurrentPage('game');
                    }
                  }}
                >
                  <div className="text-3xl mb-1">
                    {idx + 1 <= maxUnlockedLevel ? getLevelEmoji(idx + 1) : '🔒'}
                  </div>
                  <p className="font-bold">Уровень {idx + 1}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <span className="text-3xl mr-2">🌙</span>
              Ночь (Уровни 21-40)
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
              {Array.from({ length: 20 }).map((_, idx) => {
                const level = idx + 21;
                return (
                  <Card
                    key={level}
                    className={`p-4 text-center cursor-pointer hover:scale-105 transition-all border-2 ${
                      level <= maxUnlockedLevel ? 'border-secondary bg-card' : 'border-border opacity-50'
                    }`}
                    onClick={() => {
                      if (level <= maxUnlockedLevel) {
                        startGame(level);
                        setCurrentPage('game');
                      }
                    }}
                  >
                    <div className="text-3xl mb-1">
                      {level <= maxUnlockedLevel ? getLevelEmoji(level) : '🔒'}
                    </div>
                    <p className="font-bold">Уровень {level}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <span className="text-3xl mr-2">👑</span>
              Босс-битва
            </h3>
            <Card
              className={`p-8 text-center cursor-pointer hover:scale-105 transition-all border-2 max-w-xs ${
                41 <= maxUnlockedLevel ? 'border-yellow-500 bg-card' : 'border-border opacity-50'
              }`}
              onClick={() => {
                if (41 <= maxUnlockedLevel) {
                  startGame(41);
                  setCurrentPage('game');
                }
              }}
            >
              <div className="text-6xl mb-2">
                {41 <= maxUnlockedLevel ? '🤖' : '🔒'}
              </div>
              <p className="font-bold text-2xl">Доктор Зомбосс</p>
              <p className="text-sm text-muted-foreground mt-2">Финальная битва</p>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" className="mb-6" onClick={() => setCurrentPage('home')}>
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
        <h2 className="text-4xl font-bold mb-8 flex items-center">
          <Icon name="Trophy" className="mr-4 text-yellow-500" size={40} />
          Таблица лидеров
        </h2>
        <div className="space-y-3">
          {mockPlayers.map((player, idx) => (
            <Card
              key={player.id}
              className={`p-6 border-2 transition-all hover:scale-102 ${
                idx === 0 ? 'border-yellow-500 bg-yellow-500/10' :
                idx === 1 ? 'border-gray-400 bg-gray-400/10' :
                idx === 2 ? 'border-amber-700 bg-amber-700/10' :
                'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`text-3xl font-bold w-12 text-center ${
                    idx < 3 ? 'text-yellow-500' : 'text-muted-foreground'
                  }`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </div>
                  <Avatar className="h-12 w-12 bg-primary text-2xl flex items-center justify-center">
                    🎮
                  </Avatar>
                  <div>
                    <p className="font-bold text-lg">{player.name}</p>
                    <p className="text-sm text-muted-foreground">Уровень {player.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{player.rating}</p>
                  <p className="text-sm text-muted-foreground">{player.wins} побед</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(username || '');

    const handleSaveName = () => {
      if (newName.trim()) {
        localStorage.setItem('pvz_username', newName.trim());
        setUsername(newName.trim());
        setIsEditing(false);
      }
    };

    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          <Button variant="outline" className="mb-6" onClick={() => setCurrentPage('home')}>
            <Icon name="ArrowLeft" className="mr-2" size={20} />
            Назад
          </Button>
          <Card className="p-8 mb-6 border-2 border-primary">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24 bg-primary text-5xl flex items-center justify-center">
                🎮
              </Avatar>
              <div className="flex-1">
                {isEditing ? (
                  <div className="mb-4">
                    <input
                      type="text"
                      className="w-full p-3 rounded-lg bg-background border-2 border-primary outline-none text-2xl font-bold mb-2"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveName}>
                        <Icon name="Check" className="mr-2" size={16} />
                        Сохранить
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setIsEditing(false);
                        setNewName(username || '');
                      }}>
                        <Icon name="X" className="mr-2" size={16} />
                        Отмена
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-3xl font-bold">{username || 'Игрок'}</h2>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setIsEditing(true)}
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2 mb-4">
                  <Badge className="bg-primary">Уровень {maxUnlockedLevel}</Badge>
                  <Badge variant="outline" className="bg-yellow-500 text-black">
                    <Icon name="Coins" className="mr-1" size={16} />
                    {coins} монет
                  </Badge>
                </div>
                <p className="text-muted-foreground">Защитник дома • Открыто {maxUnlockedLevel} уровней</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    localStorage.removeItem('pvz_username');
                    setUsername(null);
                  }}
                >
                  <Icon name="LogOut" className="mr-2" size={16} />
                  Выйти
                </Button>
              </div>
            </div>
          </Card>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-6">
            <Icon name="Target" size={32} className="text-primary mb-2" />
            <p className="text-2xl font-bold mb-1">{maxUnlockedLevel}</p>
            <p className="text-sm text-muted-foreground">Пройдено уровней</p>
          </Card>
          <Card className="p-6">
            <Icon name="Coins" size={32} className="text-yellow-500 mb-2" />
            <p className="text-2xl font-bold mb-1">{coins}</p>
            <p className="text-sm text-muted-foreground">Монет заработано</p>
          </Card>
          <Card className="p-6">
            <Icon name="Flame" size={32} className="text-secondary mb-2" />
            <p className="text-2xl font-bold mb-1">{maxUnlockedLevel > 20 ? 'Ночь' : 'День'}</p>
            <p className="text-sm text-muted-foreground">Текущая локация</p>
          </Card>
          <Card className="p-6">
            <Icon name="Award" size={32} className="text-primary mb-2" />
            <p className="text-2xl font-bold mb-1">{maxUnlockedLevel >= 41 ? 'Да' : 'Нет'}</p>
            <p className="text-sm text-muted-foreground">Побеждён Зомбосс</p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Любимые растения</h3>
          <div className="grid grid-cols-4 gap-4">
            {allPlants.slice(0, 4).map((plant) => (
              <div key={plant.id} className="text-center">
                <div className="text-4xl mb-2">{plant.emoji}</div>
                <p className="text-sm font-medium">{plant.name}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
    );
  };

  const renderRules = () => (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="outline" className="mb-6" onClick={() => setCurrentPage('home')}>
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
        <h2 className="text-4xl font-bold mb-8">Правила игры</h2>
        
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Icon name="Target" className="mr-3 text-primary" size={28} />
              Цель игры
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Защитите свой дом от волн зомби, размещая растения на поле боя. Не дайте зомби дойти до левого края!
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Icon name="Sun" className="mr-3 text-yellow-500" size={28} />
              Солнце
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Собирайте падающее солнце кликом! Подсолнухи генерируют +25 солнца каждые 10 секунд.
            </p>
            <div className="flex gap-2">
              <Badge>Падающее: +25 солнца</Badge>
              <Badge>Подсолнух: +25 каждые 10 сек</Badge>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Icon name="Sprout" className="mr-3 text-primary" size={28} />
              Как играть
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Нажмите "Старт" чтобы начать игру</li>
              <li>Выберите растение из панели сверху</li>
              <li>Кликните по клетке поля чтобы посадить</li>
              <li>Собирайте падающее солнце кликом (☀️ = 25, ⭐ = 50)</li>
              <li>Используйте 🪓 лопату для удаления растений</li>
              <li>Используйте 🧤 перчатку для перемещения растений</li>
              <li>Каждое растение имеет время перезарядки (КД)</li>
              <li>Защищайтесь от волн зомби!</li>
            </ol>
          </Card>

          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Icon name="Map" className="mr-3 text-yellow-500" size={28} />
              Уровни и локации
            </h3>
            <div className="space-y-3 text-muted-foreground">
              <p><strong>☀️ День (1-20):</strong> Классические дневные уровни с обычными зомби</p>
              <p><strong>🌙 Ночь (21-40):</strong> Ночные уровни с усиленными зомби</p>
              <p><strong>👑 Босс (41):</strong> Финальная битва с Доктором Зомбоссом!</p>
              <p className="text-sm mt-4">Новые уровни открываются после прохождения предыдущих</p>
            </div>
          </Card>

          <Card className="p-6 bg-yellow-500/10 border-yellow-500">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Icon name="Coins" className="mr-3 text-yellow-500" size={28} />
              Монеты и магазин
            </h3>
            <div className="space-y-2 text-muted-foreground">
              <p>Зарабатывайте монеты за прохождение уровней!</p>
              <p>• За победу: +100 монет</p>
              <p>• Бонус сложности: +10 за каждый уровень</p>
              <p className="text-sm mt-4">Тратьте монеты в <strong>Магазине Дейва</strong> на улучшения!</p>
            </div>
          </Card>

          <Card className="p-6 border-2 border-primary">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Icon name="Users" className="mr-3 text-primary" size={28} />
              Мультиплеер
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Побеждайте волны зомби и соревнуйтесь с другими игроками в таблице лидеров!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderShop = () => (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" className="mb-6" onClick={() => setCurrentPage('home')}>
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold">Магазин Дейва</h2>
          <Badge className="text-2xl px-6 py-3 bg-yellow-500 text-black">
            <Icon name="Coins" className="mr-2" size={24} />
            {coins} монет
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-2 hover:border-primary transition-all">
            <div className="flex items-start gap-4">
              <div className="text-6xl">🌻</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Дополнительный слот</h3>
                <p className="text-muted-foreground mb-4">Открывает ещё один слот для растений</p>
                <Button className="w-full" disabled>
                  <Icon name="Lock" className="mr-2" size={20} />
                  500 монет
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 hover:border-primary transition-all">
            <div className="flex items-start gap-4">
              <div className="text-6xl">⚡</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Ускорение КД</h3>
                <p className="text-muted-foreground mb-4">Уменьшает время перезарядки на 20%</p>
                <Button className="w-full" disabled>
                  <Icon name="Lock" className="mr-2" size={20} />
                  750 монет
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 hover:border-primary transition-all">
            <div className="flex items-start gap-4">
              <div className="text-6xl">💰</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Больше солнца</h3>
                <p className="text-muted-foreground mb-4">Начинайте игру с 250 солнца</p>
                <Button className="w-full" disabled>
                  <Icon name="Lock" className="mr-2" size={20} />
                  1000 монет
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 hover:border-primary transition-all">
            <div className="flex items-start gap-4">
              <div className="text-6xl">🎵</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Музыкальная тема</h3>
                <p className="text-muted-foreground mb-4">Разблокировать новый саундтрек</p>
                <Button className="w-full" disabled>
                  <Icon name="Lock" className="mr-2" size={20} />
                  300 монет
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <Card className="mt-8 p-6 bg-primary/10 border-primary">
          <h3 className="text-xl font-bold mb-4">💡 Как заработать монеты?</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Проходите уровни: +100 монет за победу</li>
            <li>• Бонус за сложность: +10 монет за каждый уровень</li>
            <li>• Побеждайте зомби: +5 монет за каждого</li>
          </ul>
        </Card>
      </div>
    </div>
  );

  const renderAuth = () => {
    const [input, setInput] = useState('');

    const handleLogin = () => {
      if (input.trim()) {
        localStorage.setItem('pvz_username', input.trim());
        setUsername(input.trim());
        setCurrentPage('home');
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="p-8 max-w-md w-full border-2 border-primary">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🌻🧟</div>
            <h2 className="text-3xl font-bold mb-2">Plants vs Zombies</h2>
            <p className="text-muted-foreground">Введите ваше имя</p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              className="w-full p-3 rounded-lg bg-background border-2 border-border focus:border-primary outline-none"
              placeholder="Ваше имя"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full" size="lg">
              <Icon name="LogIn" className="mr-2" size={20} />
              Играть
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  if (!username) {
    return renderAuth();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {currentPage === 'home' && renderHome()}
      {currentPage === 'game' && renderGame()}
      {currentPage === 'levels' && renderLevels()}
      {currentPage === 'leaderboard' && renderLeaderboard()}
      {currentPage === 'profile' && renderProfile()}
      {currentPage === 'rules' && renderRules()}
      {currentPage === 'shop' && renderShop()}
    </div>
  );
}