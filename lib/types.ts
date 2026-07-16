export type ActionState = {
  error?: string;
  success?: string;
};

export type ProviderDrama = {
  id: number;
  name: string;
  slug: string;
  create_at: string;
  update_at: string;
};

export type Drama = {
  id: number;
  id_provider_drama: number;
  title: string;
  slug: string;
  deskripsi: string | null;
  total_episode: number;
  cover_imagekit_url: string | null;
  create_at: string;
  update_at: string;
  provider_drama?: Pick<ProviderDrama, 'id' | 'name' | 'slug'> | null;
};

export type Episode = {
  id: number;
  id_drama: number;
  episode: number;
  url: string;
  create_at: string;
  update_at: string;
  drama?: Pick<Drama, 'id' | 'title' | 'slug'> | null;
};

export type ImagekitApi = {
  id: number;
  name: string;
  public_key: string;
  private_key: string;
  endpoint_url: string;
  create_at: string;
  update_at: string;
};
