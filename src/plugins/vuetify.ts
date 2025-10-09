// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'
import { md3 } from 'vuetify/blueprints'

export default createVuetify({
  blueprint: md3,
  theme: {
    defaultTheme: 'system',
    themes: {
      light: {
        colors: {
          primary: '#264d88',
          background: '#f7f7f7',
          surface: '#ffffff',
          'on-primary': '#ffffff'
        }
      },
      dark: {
        colors: {
          primary: '#458cf7',
          background: '#121212',
          'on-primary': '#ffffff'
        }
      }
    }
  }
  // https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
})
