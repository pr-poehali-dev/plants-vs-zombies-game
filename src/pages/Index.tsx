import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

type Page = 'home' | 'game' | 'levels' | 'leaderboard' | 'profile' | 'rules';

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
}

interface Projectile {
  id: string;
  row: number;
  position: number;
  damage: number;
}

const allPlants: PlantType[] = [
  { id: 'sunflower', name: 'Подсолнух', emoji: '🌻', cost: 50, damage: 0, hp: 100 },
  { id: 'peashooter', name: 'Горохострел', emoji: '🌱', cost: 100, damage: 20, hp: 100, shootRate: 1350 },
  { id: 'wallnut', name: 'Орех', emoji: '🥜', cost: 150, damage: 0, hp: 400 },
  { id: 'cactus', name: 'Кактус', emoji: '🌵', cost: 200, damage: 30, hp: 150, shootRate: 1200 },
  { id: 'repeater', name: 'Повторитель', emoji: '🌿', cost: 200, damage: 20, hp: 100, shootRate: 700 },
  { id: 'chomper', name: 'Кусака', emoji: '🪴', cost: 150, damage: 100, hp: 150, shootRate: 3000 },
  { id: 'iceshooter', name: 'Ледострел', emoji: '❄️', cost: 175, damage: 15, hp: 100, shootRate: 1400 },
  { id: 'tallnut', name: 'Большой орех', emoji: '🌰', cost: 250, damage: 0, hp: 800 },
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
  const [zombiesKilled, setZombiesKilled] = useState(0);
  const [gameOver, setGameOver] = useState(false);

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
    
    const newSun: FallingSun = {
      id: `sun-${Date.now()}-${Math.random()}`,
      row,
      col,
      isCollected: false,
    };
    
    setFallingSuns(prev => [...prev, newSun]);
    
    setTimeout(() => {
      setFallingSuns(prev => prev.filter(s => s.id !== newSun.id));
    }, 5000);
  }, [gameRunning, gameOver]);

  const getAvailablePlants = useCallback(() => {
    return allPlants.slice(0, Math.min(2 + currentLevel, allPlants.length));
  }, [currentLevel]);

  useEffect(() => {
    if (!gameRunning || gameOver) return;

    const zombieSpawner = setInterval(() => {
      if (Math.random() > 0.3) {
        spawnZombie();
      }
    }, 3000);

    const sunSpawner = setInterval(() => {
      if (Math.random() > 0.5) {
        spawnFallingSun();
      }
    }, 10000);

    return () => {
      clearInterval(zombieSpawner);
      clearInterval(sunSpawner);
    };
  }, [gameRunning, gameOver, spawnZombie, spawnFallingSun]);

  useEffect(() => {
    if (!gameRunning || gameOver) return;

    const gameLoop = setInterval(() => {
      const now = Date.now();

      setZombies(prevZombies => {
        return prevZombies.map(zombie => {
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
              return zombie;
            }
            
            return { ...zombie, position: newPosition };
          }
          
          return zombie;
        });
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
  }, [gameRunning, gameOver, placedPlants, zombies]);

  const handleCellClick = (row: number, col: number) => {
    if (!selectedPlant || !gameRunning) return;

    const plantExists = placedPlants.some(p => p.row === row && p.col === col);
    if (plantExists) return;

    const plantType = allPlants.find(p => p.id === selectedPlant);
    if (!plantType || sun < plantType.cost) return;

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
    setSelectedPlant(null);
  };

  const handleSunClick = (sunId: string) => {
    setFallingSuns(prev => prev.filter(s => s.id !== sunId));
    setSun(prev => prev + 25);
  };

  const startGame = (level?: number) => {
    setGameRunning(true);
    setGameOver(false);
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
          onClick={() => setCurrentPage('game')}
        >
          <Icon name="Play" className="mr-2" size={24} />
          Начать игру
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl w-full">
        {[
          { icon: 'Gamepad2', label: 'Игра', page: 'game' as Page },
          { icon: 'Trophy', label: 'Рейтинг', page: 'leaderboard' as Page },
          { icon: 'Map', label: 'Уровни', page: 'levels' as Page },
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
              <Icon name="Users" size={20} className="mr-2" />
              Онлайн: 234
            </Badge>
          </div>
        </div>

        {gameOver && (
          <Card className="p-8 mb-6 text-center border-destructive border-2">
            <h2 className="text-4xl font-bold mb-4 text-destructive">Игра окончена!</h2>
            <p className="text-xl mb-4">Зомби добрались до вашего дома!</p>
            <p className="text-muted-foreground mb-6">Убито зомби: {zombiesKilled}</p>
            <Button onClick={startGame} size="lg" className="bg-primary">
              <Icon name="RotateCcw" className="mr-2" size={20} />
              Начать заново
            </Button>
          </Card>
        )}

        <div className="grid grid-cols-4 gap-4 mb-6">
          {getAvailablePlants().map((plant) => (
            <Card
              key={plant.id}
              className={`p-4 cursor-pointer transition-all hover:scale-105 border-2 ${
                selectedPlant === plant.id ? 'border-primary ring-2 ring-primary' : 'border-border'
              } ${sun < plant.cost || !gameRunning ? 'opacity-50' : ''}`}
              onClick={() => gameRunning && sun >= plant.cost && setSelectedPlant(plant.id)}
            >
              <div className="text-4xl text-center mb-2">{plant.emoji}</div>
              <p className="text-center font-medium text-sm">{plant.name}</p>
              <p className="text-center text-xs text-muted-foreground">☀️ {plant.cost}</p>
            </Card>
          ))}
        </div>

        <Card className="p-4 bg-gradient-to-b from-green-900/20 to-green-950/20 border-2 relative">
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
                        transform: gameRunning ? 'perspective(1000px) rotateX(2deg)' : 'none',
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
                            handleSunClick(sunHere.id);
                          }}
                        >
                          <span className="text-4xl">☀️</span>
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

        <div className="mt-6 grid grid-cols-3 gap-4">
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

  const renderLevels = () => (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" className="mb-6" onClick={() => setCurrentPage('home')}>
          <Icon name="ArrowLeft" className="mr-2" size={20} />
          Назад
        </Button>
        <h2 className="text-4xl font-bold mb-8">Выбор уровня</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <Card
              key={idx}
              className={`p-6 text-center cursor-pointer hover:scale-105 transition-all border-2 ${
                idx < 8 ? 'border-primary bg-card' : 'border-border opacity-50'
              }`}
              onClick={() => {
                if (idx < 8) {
                  startGame(idx + 1);
                  setCurrentPage('game');
                }
              }}
            >
              <div className="text-4xl mb-2">
                {idx < 8 ? '🌟' : '🔒'}
              </div>
              <p className="font-bold text-lg">Уровень {idx + 1}</p>
              {idx < 8 && <Badge className="mt-2 bg-primary">Открыт</Badge>}
              {idx >= 8 && <Badge variant="secondary" className="mt-2">Закрыт</Badge>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

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

  const renderProfile = () => (
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
              <h2 className="text-3xl font-bold mb-2">PlantMaster</h2>
              <div className="flex gap-2 mb-4">
                <Badge className="bg-primary">Уровень 15</Badge>
                <Badge variant="outline">2450 рейтинг</Badge>
              </div>
              <p className="text-muted-foreground">Игрок с начала сезона • 128 побед • 45 поражений</p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-6">
            <Icon name="Target" size={32} className="text-primary mb-2" />
            <p className="text-2xl font-bold mb-1">73%</p>
            <p className="text-sm text-muted-foreground">Процент побед</p>
          </Card>
          <Card className="p-6">
            <Icon name="Zap" size={32} className="text-yellow-500 mb-2" />
            <p className="text-2xl font-bold mb-1">12</p>
            <p className="text-sm text-muted-foreground">Победная серия</p>
          </Card>
          <Card className="p-6">
            <Icon name="Clock" size={32} className="text-secondary mb-2" />
            <p className="text-2xl font-bold mb-1">156ч</p>
            <p className="text-sm text-muted-foreground">Время игры</p>
          </Card>
          <Card className="p-6">
            <Icon name="Award" size={32} className="text-primary mb-2" />
            <p className="text-2xl font-bold mb-1">24</p>
            <p className="text-sm text-muted-foreground">Достижения</p>
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
              <li>Собирайте падающее солнце кликом</li>
              <li>Защищайтесь от волн зомби!</li>
            </ol>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {currentPage === 'home' && renderHome()}
      {currentPage === 'game' && renderGame()}
      {currentPage === 'levels' && renderLevels()}
      {currentPage === 'leaderboard' && renderLeaderboard()}
      {currentPage === 'profile' && renderProfile()}
      {currentPage === 'rules' && renderRules()}
    </div>
  );
}