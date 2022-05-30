CREATE SCHEMA IF NOT EXISTS asnet DEFAULT CHARACTER SET utf8 ;
USE `asnet` ;

CREATE TABLE IF NOT EXISTS user (
  id_user INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  numero varchar(10),
  nom VARCHAR(255) not NULL,
  prenom VARCHAR(255),
  sexe tinyint(1) not NULL,
  date_naissance date not null,
  photo varchar(200),
  date_inscription datetime,
  `status` tinyint(1) default 1,
  `type` tinyint(1) not null,
  PRIMARY KEY (`id_user`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS specialiste (
  id_specialiste INT NOT NULL,
  specialite varchar(100) not null,
  etat tinyint not null default 0,
  photo_licence varchar(200) not null,
  primary key(id_specialiste),
  foreign key (id_specialiste) references user(id_user)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;



-- CREATE TABLE IF NOT EXISTS formulaire (
-- 	id_formulaire int not null auto_increment,
--     `desc` varchar(500) , 
-- 	photo_licence varchar(200) not null,
--     id_specialiste int not null,
--     primary key (id_formulaire),
--     foreign key (id_specialiste) references specialiste(id_specialiste)
-- )
-- ENGINE = InnoDB
-- DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS `admin`(
    id_admin int not null auto_increment,           
    username varchar(100) not null,
    `password` varchar(400) not null,
    nom varchar(100) not null,
    primary key(id_admin)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS benevole(
    id_benevole int not null auto_increment,           
    nom varchar(200) not null,
    numero varchar(10) not null,
    email varchar(100) not null,
    date_inscription datetime not null,
    primary key(id_benevole)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS article(
    id_article int not null auto_increment,           
    date_creation datetime not null,
    titre varchar(200) not null,
    id_specialiste int not null,
    `image` varchar(200),
    description varchar(1000),
    primary key(id_article),
    foreign key (id_specialiste) references specialiste(id_specialiste)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS section(
    id_section int not null auto_increment,           
    titre_section varchar(200),
    contenu_section varchar(1000) not null,
    image_section varchar(200),
    indice int default 0 not null,
    id_article int not null,
    primary key(id_section),
    foreign key (id_article) references article(id_article)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS evenement(
    id_evenement int not null auto_increment,           
    date_evenement datetime not null,
    titre varchar(200) not null,
    `description` varchar(1000) not null,
    `image` varchar(200) not null,
    id_admin int not null,
    primary key(id_evenement),
    foreign key (id_admin) references `admin`(id_admin)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS tag(
    id_tag int not null auto_increment,           
    nom varchar(50) not null,
    id_article int not null,
    primary key(id_tag), 
    foreign key (id_article) references article (id_article)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

-- CREATE TABLE IF NOT EXISTS article_tag(
--     id int not null auto_increment,           
--     id_article int not null,
--     id_tag int not null,
--     primary key(id),
--     foreign key(id_article) references article(id_article),
--     foreign key(id_tag) references tag(id_tag)
-- )
-- ENGINE = InnoDB
-- DEFAULT CHARACTER SET = utf8;


CREATE TABLE IF NOT EXISTS `message`(
	id_message int not null auto_increment,
    `text` varchar(500) not null,
    date_message datetime,
    emeteur int not null,
    recepteur int not null,
    primary key(id_message),
    foreign key(recepteur) references user(id_user),
    foreign key(emeteur) references user(id_user)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;

CREATE TABLE IF NOT EXISTS `conversation`(
    id_specialiste int not null,
    id_user int not null,
    specialiste_dernier_vu int default null,
    user_dernier_vu int default null,
    date_creation datetime not null,
    id_dernier_msg int not null,
    primary key(id_specialiste, id_user),
    foreign key(id_specialiste) references specialiste(id_specialiste),
    foreign key(id_user) references user(id_user),
    foreign key(specialiste_dernier_vu) references `message`(id_message),
    foreign key(user_dernier_vu) references `message` (id_message)
)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;