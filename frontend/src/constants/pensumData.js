// Datos Oficiales del Pénsum - Fundación Rubato

export const INSTRUMENTOS_CATEGORIZADOS = [
  {
    categoria: 'Cuerdas',
    opciones: ['Violín', 'Viola', 'Violonchelo', 'Contrabajo', 'Guitarra', 'Bajo eléctrico']
  },
  {
    categoria: 'Teclados',
    opciones: ['Piano']
  },
  {
    categoria: 'Vientos',
    opciones: ['Flauta traversa', 'Clarinete', 'Trompeta', 'Trombón', 'Tuba', 'Saxofón']
  },
  {
    categoria: 'Otros',
    opciones: ['Acordeón']
  },
  {
    categoria: 'Percusión',
    opciones: ['Batería', 'Conga', 'Timbal', 'Bongo', 'Percusión folclórica', 'Percusión menor']
  },
  {
    categoria: 'Voz',
    opciones: ['Técnica vocal / Canto']
  }
];

export const INSTRUMENTOS_OFI = INSTRUMENTOS_CATEGORIZADOS.flatMap(cat => cat.opciones);

export const MODULOS_OFI = [
  'Módulo 1',
  'Módulo 2',
  'Módulo 3'
];

export const SEMESTRES_POR_MODULO = {
  'Módulo 1': ['Módulo 1-1', 'Módulo 1-2', 'Módulo 1-3', 'Módulo 1-4'],
  'Módulo 2': ['Módulo 2-1', 'Módulo 2-2', 'Módulo 2-3', 'Módulo 2-4'],
  'Módulo 3': ['Módulo 3-1', 'Módulo 3-2', 'Módulo 3-3', 'Módulo 3-4']
};

export const ASIGNATURAS_POR_MODULO = {
  'Módulo 1': [
    'Coro',
    'Creando Música',
    'Instrumento',
    'Lenguaje musical',
    'Orquesta semillero'
  ],
  'Módulo 2': [
    'Armonía',
    'Composición',
    'Ensambles Camerata Banda Girls Band',
    'Historia de la música',
    'Instrumento principal y complementario',
    'Solfeo',
    'Tecnología musical'
  ],
  'Módulo 3': [
    'Profundización con énfasis en Composición',
    'Dirección de orquesta',
    'Pedagogía',
    'Producción',
    'Orquestación (clase para línea de dirección / composición)'
  ]
};
