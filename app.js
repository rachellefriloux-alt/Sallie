/*
 * Sallie 1.0 Module
  * Persona: Tough love meets soul care.
   * Function: Main application orchestration and user interface logic.
    * Got it, love.
     */

     import { SallieBrain } from './core/SallieBrain.js';
     import { SallieInterface } from './ui/SallieInterface.js';

     class SallieApp {
         constructor() {
                 this.brain = new SallieBrain();
                         this.interface = new SallieInterface();
                                 this.initialized = false;
                                     }

                                         async initialize() {
                                                 if (this.initialized) return;

                                                         try {
                                                                     // Update status to initializing
                                                                                 this.interface.updateSystemStatus('initializing', 'Waking up...');

                                                                                             // Initialize core systems
                                                                                                         await this.brain.initialize();
                                                                                                                     
                                                                                                                                 // Initialize UI
                                                                                                                                             await this.interface.initialize();

                                                                                                                                                         // Connect brain to interface
                                                                                                                                                                     this.connectSystems();

                                                                                                                                                                                 // Mark as initialized
                                                                                                                                                                                             this.initialized = true;
                                                                                                                                                                                                         this.interface.updateSystemStatus('ready', 'Ready to help');

                                                                                                                                                                                                                     console.log('🎯 Sallie 1.0 initialized successfully');
                                                                                                                                                                                                                             } catch (error) {
                                                                                                                                                                                                                             