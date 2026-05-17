npm run build - Limpia las carpetas de builds anteriores para empezar desde cero.
npm run deploy

cf login -a https://api.cf.us10-001.hana.ondemand.com --sso - Autenticas
cf target - Se usa para cambiar de org/space una vez ya estás logueado

cf set-env tfg-ia-srv ANTHROPIC_API_KEY "sk-ant-tu-key-aqui"
cf restage tfg-ia-srv
