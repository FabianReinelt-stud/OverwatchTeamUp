/* eslint-disable */
// This file is generated from backend DRF serializers.
// Do not edit it by hand. Regenerate it with:
// python manage.py generate_dtos

export type AbilityDto = {
  name: string;
  description: string;
  icon: string;
};

export type HeroSummaryDto = {
  display_name: string;
  portrait_url: string;
  role: string;
};

export type HeroDto = {
  hero_key: string;
  display_name: string;
  role: string;
  subrole: string;
  winrate: string;
  pickrate: string;
  health: number;
  armor: number;
  shields: number;
  portrait_url: string;
  description: string;
  abilities: AbilityDto[];
};

export type TeamCompositionDto = {
  id: number;
  name: string;
  hero_1: HeroDto;
  hero_2: HeroDto;
  hero_3: HeroDto;
  hero_4: HeroDto;
  hero_5: HeroDto;
  created_at: string;
  average_winrate: string;
};

export type TeamCompositionCreateUpdateDto = {
  name: string;
  hero_1_key: string;
  hero_2_key: string;
  hero_3_key: string;
  hero_4_key: string;
  hero_5_key: string;
};

export type RegisterRequestDto = {
  username: string;
  password: string;
};

export type RegisterResponseDto = {
  id: number;
  username: string;
};

export type TokenRequestDto = {
  username: string;
  password: string;
};

export type TokenResponseDto = {
  access: string;
  refresh: string;
};

export type TokenRefreshRequestDto = {
  refresh: string;
};

export type TokenRefreshResponseDto = {
  access: string;
};
