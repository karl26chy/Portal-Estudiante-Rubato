# Migraciones de Base de Datos

En este directorio se deben almacenar los scripts de migración futuros para la base de datos de producción/desarrollo de **Portal Estudiante Rubato**.

## Funcionamiento y Reglas de Migración

1. **Sin Herramienta Automatizada**: No existe una herramienta automatizada (como Knex, Sequelize o Liquibase) para ejecutar las migraciones.
2. **Ejecución Manual**: Cada script de migración debe aplicarse de forma **manual** y en orden cronológico contra la base de datos real (por ejemplo, a través de la CLI de MySQL o un gestor gráfico como DBeaver/HeidiSQL).
3. **Nomenclatura**: Los nuevos archivos deben numerarse de forma secuencial empezando de nuevo desde `001_` (ejemplo: `001_add_new_table.sql`, `002_update_column_x.sql`, etc.) para mantener la claridad histórica de los cambios.
