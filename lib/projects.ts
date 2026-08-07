export interface Project {
  name: string
  nameEn: string
  description: string
  descriptionEn?: string
  url: string
  icon?: string
  domain: string
}

// Curated public repositories from Saikat Das's GitHub profile. Descriptions
// and live repository metadata are fetched separately and are not invented.
export const projects: Project[] = [
  'JobPulse',
  'cloudrack',
  'teamsync',
  'eduspark',
  'talent-orbit',
  'WordFlow',
  'weathersheet',
  'railway-curve',
  'LinkedIn-Image-Saver-Bot',
].map((name) => ({
  name,
  nameEn: name,
  description: '',
  url: `https://github.com/X-Saikat-93/${name}`,
  domain: 'github.com',
}))
