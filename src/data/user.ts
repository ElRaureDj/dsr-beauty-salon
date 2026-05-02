// DSR — User profile, appointments and capsule stories

import { I } from './images';
import type { Appointment, Story } from '../types';

export interface UserProfile {
  name: string;
  fullName: string;
  email: string;
  joined: string;
  points: number;
  visits: number;
  spent: number;
  preferredArtisans: string[];
  appointments: Appointment[];
}

export const USER: UserProfile = {
  name: 'Camila',
  fullName: 'Camila Vargas',
  email: 'camila@gmail.com',
  joined: '2023-04-12',
  points: 2840,
  visits: 18,
  spent: 3120,
  preferredArtisans: ['isabela', 'olivia'],
  appointments: [
    {
      id: 'apt-2026-05-08',
      date: '2026-05-08',
      time: '15:30',
      services: ['color-balayage', 'cut-signature'],
      artisan: 'isabela',
      status: 'confirmed',
      total: 335,
      duration: 255,
      notes_es: 'Quiero conservar la luz pero matizar un poco más cálido.',
    },
    {
      id: 'apt-2026-04-12',
      date: '2026-04-12',
      time: '11:00',
      services: ['mani-gel'],
      artisan: 'olivia',
      status: 'past',
      total: 85,
      duration: 90,
    },
    {
      id: 'apt-2026-03-22',
      date: '2026-03-22',
      time: '17:00',
      services: ['facial-gold'],
      artisan: 'leonor',
      status: 'past',
      total: 220,
      duration: 90,
    },
  ],
};

export const STORIES: Story[] = [
  {
    id: 's1',
    artisan: 'isabela',
    title_es: 'Detrás del balayage',
    title_en: 'Behind the balayage',
    cover: I('story-balayage'),
  },
  {
    id: 's2',
    artisan: 'olivia',
    title_es: 'Cromados de temporada',
    title_en: 'Seasonal chrome',
    cover: I('story-chrome'),
  },
  {
    id: 's3',
    artisan: 'leonor',
    title_es: 'Ritual de la mañana',
    title_en: 'Morning ritual',
    cover: I('story-morning'),
  },
  {
    id: 's4',
    artisan: 'marta',
    title_es: 'SPF, todo el año',
    title_en: 'SPF, year-round',
    cover: I('story-spf'),
  },
  {
    id: 's5',
    artisan: 'ana',
    title_es: 'Cortes que crecen bien',
    title_en: 'Cuts that grow out',
    cover: I('story-cuts'),
  },
];
