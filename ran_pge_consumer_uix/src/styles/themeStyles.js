import {createGlobalStyle} from 'styled-components'

/**
 * Define theme colors used throughout the application. Includes colors for both light and dark themes
 * as well as specific UI components like sidebars, message content backgrounds, text messages, etc.
 */
const themeColors = {
    primary: '#0081cb', // Un bleu plus foncé pour le thème sombre
    secondary: '#9da0a6', // Un gris plus clair pour le thème sombre
    success: '#218838', // Un vert plus foncé pour le thème sombre
    danger: '#e3342f', // Un rouge plus foncé pour le thème sombre
    warning: '#ffa800', // Orange pour le thème sombre
    info: '#118ab2', // Un bleu-vert plus foncé pour le thème sombre
    light: '#e2e8f0', // Un gris très clair pour le thème sombre
    dark: '#212529', // Un noir profond pour le thème sombre 
    black : '#000',
    white : '#fff',
    sidebar_light :'#f0f0f0',
    sidebar_dark: '#252526',
    main_light:'#ffffff',
    main_dark:'#1e1e1e',
    messagecontentBotLight : '#E1EFFE',
    messagecontentUserLight : '#F0F0F0',
    messagecontentBotDark : '#2B4A66',
    messagecontentUserDark : '#4A4A4A',
    texteMessageLight : '#333333',
    texteMessageDark : '#FFFFFF',
    dropdownMenu_border: "#ddd",
    boxShadowLight: "0 2px 8px rgba(0, 0, 0, 0.1)",
    boxShadowDark: "0 2px 8px rgba(255, 255, 255, 0.1)",
    boxShadowEvaluationLight: "0px 87px 78px -39px rgba(0,0,0,0.4)",
    boxShadowEvaluationDark: "0px 87px 78px -39px rgba(255,255,255,0.2)",
    overlayDark : 'rgba(87, 82, 82, 0.8)',
    overlayLight : 'rgba(51, 45, 45, 0.3)',
    skema_color : "#026973",
    gray_50: '#f9f9f9',
    gray_100: '#ececec',
    gray_200: '#cdcdcd',
    gray_300: '#b4b4b4',
    gray_400: '#9b9b9b',
    gray_500: '#676767',
    gray_600: '#424242',
    gray_700: '#2f2f2f',
    gray_800: '#212121',
    gray_900: '#171717',
    gray_950: '#0d0d0d',
    text_primary: '#0d0d0d',
    text_secondary: '#676767',
    link: '#2964aa',
    link_hover: '#749ac8',
  };

  /**
 * Global styles for the application. Utilizes theme provided via styled-components ThemeProvider
 * to apply appropriate colors based on the current theme (light or dark).
 * Includes styles for components like navigation bar, menu links, icons, profile pictures, dropdown menus,
 * and various elements across different components ensuring consistent look and feel.
 */
export const GlobaleStyles = createGlobalStyle`
    *, *::before, *::after {
        transition: background-color 0.2s linear, color 0.2s linear;
    }

    .sk-navbar {
        background-color: ${({theme}) => theme.body};
        box-shadow: ${({theme}) => theme.boxShadowDropdown};
    };

    .sk-nav-link {
        color: ${({theme}) => theme.text};
    };
      
    .sk-menu-icon {
        background-color: "transparent";
        border: 1px solid ${({theme}) => theme.text};
    };

    .sk-icon_nav {
        background-color: ${({theme}) => theme.text};
    };

    .sk-icon_nav::before,
    .sk-icon_nav::after {
        background-color: ${({theme}) => theme.text};
    };
  
    .sk-initialsCircle {
        background-color: ${({ theme }) => theme.skema_color};
        color: ${({theme}) => theme.text};
    };
  
    .sk-profileName {
        color: ${({theme}) => theme.text};
    };
  
    .sk-dropdownMenu {
        background-color: ${({theme}) => theme.body};
        border: 1px solid #ddd;
        box-shadow: ${({theme}) => theme.boxShadowDropdown};
    };

    .profile-dropdown-menu a{
        background-color : ${({theme}) => theme.main_chat};
        color : ${({theme}) => theme.text};
    }
  
    .sk-dropdownMenu a {
        color: ${({theme}) => theme.text};
    };
  
    .sk-dropdownMenu a:hover {
        background-color: ${({theme}) => theme.skema_color};
    };

    .sk-body-private {
        background-color: ${({theme}) => theme.main_chat};
        min-height : 100vh
    };

    @media (max-width: 768px) {
        .sk-navbar-links {
          background-color: ${({theme}) => theme.body};
          box-shadow: ${({theme}) => theme.boxShadowDropdown};
        }
    };

    .sk-title-header, .text-theme{
        color : ${({theme}) => theme.text};
    };

    #sidebar-container {
        background-color: ${({theme}) => theme.sidebar_chat};
        color : ${({theme}) => theme.text};
    };
    
    .profile-initials{
        background-color: ${({ theme }) => theme.skema_color};
        font-weight: bold;
        color : ${({theme}) => theme.text};
    };

    .profile-container{
        background-color: ${({theme}) => theme.sidebar_chat};
    };


    #toggle-button {
        color : ${({theme}) => theme.text};
    };

    .toggle-icon, 
    .toggle-icon::before,
    .toggle-icon::after{
        background-color : ${({theme}) => theme.text};
    };

    #overlay {
        background-color: ${({theme}) => theme.overlaySidebar};
    };

    .options-icon{
        color : ${({theme}) => theme.text};
    }
    
    .add-chat-button{
        color: ${({theme}) => theme.text};
        border: 1px solid ${({theme}) => theme.text};
    };

    #content {
        background-color: ${({theme}) => theme.main_chat};
        color : ${({theme}) => theme.text};
    };

    

    .sk-user .sk-message-content{
        background-color: ${({theme}) => theme.textbackgroundUser};
        color: ${({theme}) => theme.textmsg};
    };

    .sk-bot .sk-message-content{
        background-color: ${({theme}) => theme.textbackgroundBot};
        color: ${({theme}) => theme.textmsg};
    };

    .textarea-chat{
        border: 2px solid #ccc;
        background-color: ${({theme}) => theme.main_chat};
        color : ${({theme}) => theme.text};
        box-shadow: 0 2px 4px ${({theme}) => theme.boxShadowDropdown};
    };

    .voice-selector-modal h2,
    .voice-selector-modal p {
        text-align: center;
        color: ${({theme}) => theme.text};
    };

    .theme-selector h2{
        color: ${({theme}) => theme.text};
    };

    .theme-switch-dark, .theme-switch-light {
        color: ${({theme}) => theme.text};
        font-size: 16px;
        font-weight: bold;
    };

    .radio-input{
        box-shadow: ${({theme}) => theme.boxShadowEvaluation};
    };

    .msg-instruction p, .score p, .score-legend span, .title-theme {
        color: ${({theme}) => theme.text};
    };

    .timer-quiz{
        color: ${({theme}) => theme.text};
        font-size: 16px;
        font-weight: bold;
    };

    .expander, .expander-icon, .expander-title{
        color: ${({theme}) => theme.text};
    };

    .expander-header {
        background-color: ${({theme}) => theme.body};
    }
    .expander-content {
        color: ${({theme}) => theme.text};
    };

    
`;

/**
 * Light theme settings for the application. Combines themeColors with specific light theme overrides.
 * Used by ThemeProvider to style the application in light mode.
 */
export const lightTheme = {
    ...themeColors,
    name: 'light',
    body : themeColors.white,
    text : themeColors.black,
    overlaySidebar :themeColors.overlayLight,
    boxShadowDropdown: themeColors.boxShadowLight,
    boxShadowEvaluation: themeColors.boxShadowEvaluationLight,
    borderDropdown: themeColors.dropdownMenu_border,
    hoverDropdown : themeColors.gray_100,
    sidebar_chat : themeColors.sidebar_light,
    main_chat : themeColors.main_light,
    textmsg : themeColors.texteMessageLight,
    textbackgroundBot : themeColors.messagecontentBotLight,
    textbackgroundUser : themeColors.messagecontentUserLight,
    expander : '#fff',
}

/**
 * Dark theme settings for the application. Combines themeColors with specific dark theme overrides.
 * Used by ThemeProvider to style the application in dark mode.
 */
export const darkTheme = {
    ...themeColors,
    name: 'dark',
    body : themeColors.black,
    text : themeColors.white,
    overlaySidebar :themeColors.overlayDark,
    boxShadowDropdown: themeColors.boxShadowDark,
    boxShadowEvaluation: themeColors.boxShadowEvaluationDark,
    borderDropdown: themeColors.gray_300,
    hoverDropdown : themeColors.gray_500,
    sidebar_chat : themeColors.sidebar_dark,
    main_chat : themeColors.main_dark,
    textmsg : themeColors.texteMessageDark,
    textbackgroundBot : themeColors.messagecontentBotDark,
    textbackgroundUser : themeColors.messagecontentUserDark,
    expander : themeColors.main_dark,
}