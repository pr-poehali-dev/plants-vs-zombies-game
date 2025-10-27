'''
Business: WebSocket multiplayer synchronization for Plants vs Zombies game
Args: event with httpMethod, body containing game state updates
Returns: HTTP response with updated game state or connection status
'''

import json
import time
from typing import Dict, Any, List

active_games: Dict[str, Dict[str, Any]] = {}
player_connections: Dict[str, List[Dict[str, Any]]] = {}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        try:
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            user_id = body_data.get('userId')
            
            if action == 'join':
                game_id = body_data.get('gameId', 'default')
                
                if game_id not in active_games:
                    active_games[game_id] = {
                        'players': [],
                        'state': 'waiting',
                        'created_at': time.time()
                    }
                
                if game_id not in player_connections:
                    player_connections[game_id] = []
                
                player_data = {
                    'userId': user_id,
                    'username': body_data.get('username', 'Player'),
                    'joined_at': time.time()
                }
                
                player_connections[game_id].append(player_data)
                active_games[game_id]['players'] = player_connections[game_id]
                
                if len(player_connections[game_id]) >= 2:
                    active_games[game_id]['state'] = 'ready'
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'gameId': game_id,
                        'players': active_games[game_id]['players'],
                        'state': active_games[game_id]['state']
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'update':
                game_id = body_data.get('gameId')
                game_state = body_data.get('state')
                
                if game_id in active_games:
                    active_games[game_id]['last_update'] = game_state
                    active_games[game_id]['updated_at'] = time.time()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'players': active_games.get(game_id, {}).get('players', [])
                    }),
                    'isBase64Encoded': False
                }
                
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)}),
                'isBase64Encoded': False
            }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        game_id = params.get('gameId', 'default')
        
        game_data = active_games.get(game_id, {
            'players': [],
            'state': 'waiting'
        })
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(game_data),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
