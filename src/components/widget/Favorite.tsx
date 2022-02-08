import { StarFilled, StarOutlined } from '@ant-design/icons';
import { STAKING_FAV_KEY, useFavorites } from '../../hooks/favorites';

interface FavoriteProps {
  account: string;
}

export function Favorite({ account }: FavoriteProps) {
  const [favorites, toggleFavorite] = useFavorites(STAKING_FAV_KEY);
  const isFavorite = favorites.includes(account);

  return (
    <div onClick={() => toggleFavorite(account)}>
      {isFavorite ? <StarFilled className="text-yellow-400" /> : <StarOutlined />}
    </div>
  );
}
