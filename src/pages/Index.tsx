import { useState } from 'react';
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
}

interface ZombieType {
  id: string;
  name: string;
  emoji: string;
  hp: number;
}

const plants: PlantType[] = [
  { id: 'sunflower', name: 'Подсолнух', emoji: '🌻', cost: 50, damage: 0 },
  { id: 'peashooter', name: 'Горохострел', emoji: '🌱', cost: 100, damage: 20 },
  { id: 'wallnut', name: 'Орех', emoji: '🥜', cost: 150, damage: 0 },
  { id: 'cactus', name: 'Кактус', emoji: '🌵', cost: 200, damage: 30 },
];

const zombies: ZombieType[] = [
  { id: 'basic', name: 'Обычный', emoji: '🧟', hp: 100 },
  { id: 'cone', name: 'С ведром', emoji: '🧟‍♂️', hp: 200 },
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

        <div className="grid grid-cols-4 gap-4 mb-6">
          {plants.map((plant) => (
            <Card
              key={plant.id}
              className={`p-4 cursor-pointer transition-all hover:scale-105 border-2 ${
                selectedPlant === plant.id ? 'border-primary ring-2 ring-primary' : 'border-border'
              } ${sun < plant.cost ? 'opacity-50' : ''}`}
              onClick={() => sun >= plant.cost && setSelectedPlant(plant.id)}
            >
              <div className="text-4xl text-center mb-2">{plant.emoji}</div>
              <p className="text-center font-medium text-sm">{plant.name}</p>
              <p className="text-center text-xs text-muted-foreground">☀️ {plant.cost}</p>
            </Card>
          ))}
        </div>

        <Card className="p-8 bg-gradient-to-b from-green-900/20 to-green-950/20 border-2">
          <div className="grid grid-rows-5 gap-3">
            {Array.from({ length: 5 }).map((_, row) => (
              <div key={row} className="grid grid-cols-9 gap-3">
                {Array.from({ length: 9 }).map((_, col) => (
                  <div
                    key={`${row}-${col}`}
                    className="aspect-square bg-background/30 rounded-lg border-2 border-border/50 hover:bg-primary/20 transition-all cursor-pointer flex items-center justify-center text-3xl"
                  >
                    {col === 0 && row === 1 && <span className="animate-pulse">🌻</span>}
                    {col === 2 && row === 1 && <span className="animate-pulse">🌱</span>}
                    {col === 7 && row === 1 && <span style={{ animation: 'shake 1s infinite' }}>🧟</span>}
                    {col === 8 && row === 3 && <span style={{ animation: 'shake 1s infinite' }}>🧟‍♂️</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Волна</p>
            <p className="text-2xl font-bold">3 / 10</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Убито зомби</p>
            <p className="text-2xl font-bold">47</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Здоровье</p>
            <div className="w-full bg-border rounded-full h-3">
              <div className="bg-primary h-3 rounded-full" style={{ width: '75%' }}></div>
            </div>
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
              onClick={() => idx < 8 && setCurrentPage('game')}
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
            {plants.map((plant) => (
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
              Защитите свой дом от волн зомби, размещая растения на поле боя. Каждая волна становится сложнее!
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Icon name="Sun" className="mr-3 text-yellow-500" size={28} />
              Солнце
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Солнце нужно для посадки растений. Собирайте падающее солнце или сажайте подсолнухи для генерации.
            </p>
            <div className="flex gap-2">
              <Badge>Подсолнух: +25 солнца</Badge>
              <Badge>Падающее: +25 солнца</Badge>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Icon name="Sprout" className="mr-3 text-primary" size={28} />
              Растения
            </h3>
            <div className="space-y-3">
              {plants.map((plant) => (
                <div key={plant.id} className="flex items-center gap-4 p-3 bg-background/50 rounded-lg">
                  <span className="text-3xl">{plant.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold">{plant.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Стоимость: {plant.cost} ☀️ • Урон: {plant.damage > 0 ? plant.damage : 'Защита'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Icon name="Skull" className="mr-3 text-secondary" size={28} />
              Зомби
            </h3>
            <div className="space-y-3">
              {zombies.map((zombie) => (
                <div key={zombie.id} className="flex items-center gap-4 p-3 bg-background/50 rounded-lg">
                  <span className="text-3xl">{zombie.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold">{zombie.name}</p>
                    <p className="text-sm text-muted-foreground">Здоровье: {zombie.hp} HP</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-2 border-primary">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Icon name="Users" className="mr-3 text-primary" size={28} />
              Мультиплеер
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Соревнуйтесь с игроками онлайн! Побеждайте волны зомби быстрее соперников и поднимайтесь в рейтинге.
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
