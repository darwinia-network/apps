import { StarFilled, StarOutlined } from '@ant-design/icons';
import { useStaking } from '../../hooks';

interface FavoriteProps {
  account: string;
  className?: string;
}

export function Favorite({ account, className = '' }: FavoriteProps) {
  const { favorites, setFavorite } = useStaking();

  return (
    <div onClick={() => setFavorite(account)} className={className + ' cursor-pointer'}>
      {favorites.includes(account) ? <StarFilled className="text-yellow-400" /> : <StarOutlined />}
    </div>
  );
}
