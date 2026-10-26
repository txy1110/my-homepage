-- MySQL 5.7+ schema for the personal homepage content.
-- Execute with a database that uses utf8mb4.

CREATE DATABASE IF NOT EXISTS personal_homepage
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE personal_homepage;

-- 主资料表：作为技能、项目和文章的共同归属实体。
CREATE TABLE IF NOT EXISTS profiles (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  title VARCHAR(120) NOT NULL,
  bio TEXT NOT NULL,
  email VARCHAR(254) NOT NULL,
  city VARCHAR(100) NOT NULL,
  birthday DATE NULL,
  job VARCHAR(100) NOT NULL,
  avatar_emoji VARCHAR(32) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- 技能表：每项技能属于一份资料，名称在同一资料下唯一并按 sort_order 展示。
CREATE TABLE IF NOT EXISTS skills (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  profile_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(80) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_skills_profile_name (profile_id, name),
  KEY idx_skills_profile_order (profile_id, sort_order),
  CONSTRAINT fk_skills_profile
    FOREIGN KEY (profile_id) REFERENCES profiles (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 项目表：使用字符串项目 ID 供页面路由引用，每个项目归属于一份资料。
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(80) NOT NULL,
  profile_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(80) NOT NULL,
  description VARCHAR(500) NOT NULL,
  status ENUM('进行中', '已完成', '规划中') NOT NULL DEFAULT '规划中',
  tech VARCHAR(120) NOT NULL,
  period VARCHAR(60) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_projects_profile_status (profile_id, status),
  CONSTRAINT fk_projects_profile
    FOREIGN KEY (profile_id) REFERENCES profiles (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 文章表：保存发布状态及可选项目关联；删除项目时保留文章并解除关联。
CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(100) NOT NULL,
  profile_id BIGINT UNSIGNED NOT NULL,
  project_id VARCHAR(80) NULL,
  title VARCHAR(100) NOT NULL,
  summary VARCHAR(240) NOT NULL,
  content TEXT NOT NULL,
  publish_date DATE NOT NULL,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_articles_profile_published_date (profile_id, published, publish_date),
  KEY idx_articles_profile_project (profile_id, project_id),
  CONSTRAINT fk_articles_profile
    FOREIGN KEY (profile_id) REFERENCES profiles (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_articles_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB;
