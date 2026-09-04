Componente → dispara Action → Reducer procesa → Store actualiza → Componente reacciona

Visualmente:
Un componente dispara una Action (ej: "usuario hizo clic en guardar")
Esa Action llega a un Reducer, una función pura que calcula el nuevo estado
El Store se actualiza con ese nuevo estado
Los componentes suscritos (vía Selectors) reaccionan automáticamente al cambio

