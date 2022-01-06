export class CreateRequestDto {
  name: string;
  url?: string;
  query: string;
  headers?: { key: string; value: string }[];
  variables?: any;
  workspace?: string;
  owner: string;
}
