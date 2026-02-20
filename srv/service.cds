using { tfg as db } from '../db/schema';

service GreetingService {
  entity Greetings as projection on db.Greeting;
}