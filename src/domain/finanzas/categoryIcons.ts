import type { ComponentType } from 'react'
import {
  BookIcon,
  CarIcon,
  CartIcon,
  DollarIcon,
  DotsIcon,
  GameIcon,
  HeartIcon,
  HomeIcon,
  PiggyBankIcon,
  ReceiptIcon,
  type IconProps,
} from '../../components/icons/Icons'

const CATEGORY_ICONS: Record<string, ComponentType<IconProps>> = {
  cart: CartIcon,
  home: HomeIcon,
  game: GameIcon,
  car: CarIcon,
  book: BookIcon,
  heart: HeartIcon,
  dots: DotsIcon,
  piggy: PiggyBankIcon,
  dollar: DollarIcon,
  receipt: ReceiptIcon,
}

export function categoryIcon(icon: string): ComponentType<IconProps> {
  return CATEGORY_ICONS[icon] ?? DotsIcon
}
