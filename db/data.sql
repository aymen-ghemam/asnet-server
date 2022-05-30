CREATE SCHEMA IF NOT EXISTS asnet DEFAULT CHARACTER SET utf8 ;
USE `asnet` ;

insert into user (nom, prenom, email, password, numero, sexe, date_naissance, photo, type, date_inscription) 
values('DR', 'who', 'test', 'test', '0779878203', 1, '1961-02-11', '', 1, now());
insert into user (nom, prenom, email, password, numero, sexe, date_naissance, photo, type, date_inscription) 
values('user', 'user', 'user', 'user', '0779878203', 1, '1961-02-11', '', 2, now());

insert into specialiste(id_specialiste, specialite, etat, photo_licence) values(1, 'specialite te3ou', 0, '');

insert into admin (username, password, nom) values ('admin', 'admin', 'admin');


insert into article(date_creation, titre, id_specialiste, image, description) 
values (now(), 'article 1', 1, 'http://localhost:5000/api/uploads/event.jpg', 'this is some description');
insert into section(id_article, titre_section, contenu_section, image_section, indice) 
values (1, '', 'this is just some text', '', 0);
insert into section(id_article, titre_section, contenu_section, image_section, indice) 
values (1, 'section title', 'this is just some text', 'http://localhost:5000/api/uploads/event.jpg', 1);


insert into evenement (date_evenement, titre, description, image, id_admin) 
values (now(), 'event1', 'this is just an event', 'http://localhost:5000/api/uploads/event.jpg', 1);


insert into message (text, date_message, emeteur, recepteur) values ('hello', now(), 2, 1);

insert into conversation (id_specialiste, id_user, date_creation, id_dernier_msg) values (1, 2, now(), 1);