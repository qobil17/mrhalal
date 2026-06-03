import { registerEnumType } from '@nestjs/graphql';

export enum Language {
  UZ = 'uz',
  KO = 'ko',
  AR = 'ar',
  EN = 'en',
}

registerEnumType(Language, {
  name: 'Language',
  description: 'Supported languages: Uzbek, Korean, Arabic, English',
});
