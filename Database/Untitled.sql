-- MySQL dump 10.13  Distrib 8.0.44, for macos15 (arm64)
--
-- Host: localhost    Database: ai_chat_db
-- ------------------------------------------------------
-- Server version	9.5.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '412f4060-f5d4-11f0-b60f-dbfe690f1126:1-407';

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `persona_id` int NOT NULL DEFAULT '1',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'New conversation',
  `model` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'gpt-4o',
  `status` enum('active','archived') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_conv_persona` (`persona_id`),
  KEY `idx_conv_status` (`status`),
  KEY `idx_conv_updated` (`updated_at`),
  CONSTRAINT `fk_conv_persona` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_conv_title_not_empty` CHECK ((char_length(trim(`title`)) > 0)),
  CONSTRAINT `chk_valid_model` CHECK ((`model` in (_utf8mb4'gpt-4o',_utf8mb4'gpt-4o-mini',_utf8mb4'gpt-3.5-turbo')))
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,1,'my first convarsation','gpt-4o','archived','2026-05-09 17:11:23','2026-05-10 06:55:22'),(5,2,'New conversation','gpt-4o','archived','2026-05-11 07:47:40','2026-05-11 10:56:12'),(7,1,'Casual Greetings and Connections','gpt-4o','archived','2026-05-11 09:06:06','2026-05-11 09:37:50'),(9,1,'Casual Greetings and Small Talk','gpt-4o','active','2026-05-11 09:53:39','2026-05-11 09:53:43');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `role` enum('user','assistant','system') COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_count` int unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `message_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
  `file_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_msg_conv_time` (`conversation_id`,`created_at`),
  CONSTRAINT `fk_msg_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `chk_msg_content_not_empty` CHECK ((char_length(trim(`content`)) > 0)),
  CONSTRAINT `chk_msg_token_positive` CHECK (((`token_count` is null) or (`token_count` > 0)))
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,'user','hello , im daniel !',NULL,'2026-05-10 06:36:15','text',NULL),(2,1,'user','hello , im daniel !',NULL,'2026-05-10 06:38:23','text',NULL),(3,1,'assistant','Hello Daniel! How can I assist you today?',52,'2026-05-10 06:38:26','text',NULL),(26,5,'user','[Image]: what size do you think is this plate',NULL,'2026-05-11 07:48:12','image','/Users/danielmachluf/projects /FullStack Projects/Projects/AI-Project-Daniel-Machluf/Backend/uploads/DA2ED599-2ED8-42CF-AC46-4F877CC969B3.png'),(27,5,'assistant','The plate in the image is actually a large pan, likely used for cooking a dish in a communal or outdoor setting. It\'s quite large, as evidenced by the number of eggs and the people in the background for scale. It’s probably several feet in diameter, often used for making dishes like paella or shakshuka at large gatherings or festivals.',901,'2026-05-11 07:48:24','text',NULL),(28,5,'user','[PDF Content]: Full Stack & GenAI Development \nVCP – AI Coding Prompt Generator\nAI Recipe Generator\nJohn Bryce , Tel Aviv. 2025-2026\nJ U N I O R  F U L L  S T A C K\n&  A I  D E V E L O P E R\nT E C H N I C A L  S K I L L S\nS U M M A R Y\nW O R K  E X P E R I E N C E\nE D U C A T I O N\nS E L E C T E D  P R O J E C T S\nDANIEL MACHLUF\nJunior Full Stack & AI Developer with hands-on experience building modern web applications, AI-powered products, and live client websites.\nGraduate of John Bryce’s Full Stack & GenAI Development program with outstanding grades all above 90. Brings strong creativity, rapid\nlearning ability, adaptability, and a solution-oriented mindset, with practical experience in both product development and client-facing\ndelivery.\n050-639-6374\nDanielmachluf420@gmail.com\nlinkedin.com/in/daniel-machluf\nAshkelon, Israel\nFrontend: React, TypeScript, JavaScript, HTML, CSS, Redux Toolkit, Material UI\nBackend & APIs: Node.js, REST APIs, OpenAI API\nDatabases & Cloud: SQL, NoSQL, Firebase, AWS\nTools & Workflow: Git, GitHub, Docker, Responsive Design, State Management, Local Storage\nAI & Modern Development: Prompt Engineering, AI Integration, GenAI Product Development, AI-Assisted Development\nCo-founded a web development business delivering websites for real clients. Led both technical execution and client communication,\nincluding requirement gathering, website planning, concept alignment, development, revisions, and final delivery.\nBuilt and launched live client websites from idea to production\nWorked directly with clients to define goals, structure, and design direction\nCombined development work with strong service-oriented communication\nManaged the bar station independently in a fast-paced restaurant environment\nMaintained operational flow, organization, and high service standards under pressure\nManaged shift responsibilities including customer service and daily operational support\nRecognized for reliability, strong communication, and positive team presence\nMibitech\nOshi Oshi , Ashkelon\nGolda\nHigh School Diploma Extended Biology and\nPsychology\nCo-Founder & Web Developer · 2025 – Present\nBar Operator / Restaurant Team Member · 2025 – 2026\nShift Manager · 2021 – 2022\nMakif Ironi Alef High School\nCryptical – Cryptocurrency Tracking Application\nBuilt a React and TypeScript app that turns raw ideas into\nstructured prompts for AI coding tools using the OpenAI API.\nBuilt a React and TypeScript crypto tracker with live market\ndata, multi-coin comparison, and persistent local storage.\nDeveloped a React and TypeScript app that generates\ncomplete recipes with the OpenAI API, including language-\naware responses and local history.\nLanguages - Hebrew — Native | English — Fluent\nLive Client Work Available Upon Request\nOpen to Junior Full Stack / AI Developer Roles\n\n\nUser question: can you give me improvements tip ?',NULL,'2026-05-11 07:49:17','pdf','/Users/danielmachluf/projects /FullStack Projects/Projects/AI-Project-Daniel-Machluf/Backend/uploads/Daniel Machluf Resume.pdf'),(29,5,'assistant','Certainly! Improving your document, especially when it\'s a resume or CV, involves making sure it effectively communicates your skills, experiences, and potential to your target audience. Here are some tips to enhance it:\n\n1. **Highlight Achievements, Not Just Duties**:\n   - When listing your work experiences, focus on what you achieved or learned, rather than just describing tasks. For example, instead of saying \"Managed shift responsibilities,\" you could say \"Successfully streamlined shift responsibilities to enhance customer service efficiency by 20%.\"\n\n2. **Quantify Your Impact**:\n   - Whenever possible, use numbers to quantify your successes. For instance, \"Led website redesign that resulted in a 30% increase in client engagement.\"\n\n3. **Customize the Content**:\n   - Tailor your resume towards the job you are applying for. If you are focusing on Full Stack roles, make sure to bring those experiences and skills to the forefront.\n\n4. **Organize Information Effectively**:\n   - Consider using bullet points for easy readability. This helps emphasize key information quickly, which is beneficial as recruiters usually skim through resumes.\n\n5. **Skills Section**:\n   - Break down the skills into subsections if necessary. For example, place AI-specific skills separately to make them stand out.\n\n6. **Add Personal Projects or Contributions**:\n   - If you\'ve contributed to open-source projects or have personal projects, mention them. It shows initiative and an active interest in development.\n\n7. **Visual Layout**:\n   - Ensure that your contact information is easy to find. Perhaps place it at the top under your name. A clear, professional layout also makes a big difference.\n\n8. **Grammar and Consistency**:\n   - Make sure the document is free from grammatical errors. Also, maintain a consistent format for dates and titles.\n\n9. **Professional Summary Enhancement**:\n   - The first few lines of your summary should grab attention. You could refine it to begin with strong, definitive skills - for example, \"Creative and solution-oriented Junior Full Stack Developer with top distinction in advanced GenAI methods and AI integration.\"\n\n10. **Feedback**:\n    - Seek feedback from peers or mentors. They might see something you\'ve missed or suggest improvements.\n\nTo make sure you’ve understood these tips, could you tell me which section you think could benefit the most from adding quantifiable achievements?',1922,'2026-05-11 07:49:26','text',NULL),(30,5,'user','hi',NULL,'2026-05-11 08:24:06','text',NULL),(31,5,'assistant','Hello! How can I assist you today? Do you need help with understanding a concept, improving a document, or something else entirely?',NULL,'2026-05-11 08:24:06','text',NULL),(32,7,'user','hi',NULL,'2026-05-11 09:06:08','text',NULL),(33,7,'assistant','Hello! How can I assist you today?',NULL,'2026-05-11 09:06:08','text',NULL),(34,7,'user','[Image]: rate tasty meter from 0-10',NULL,'2026-05-11 09:06:38','image','/Users/danielmachluf/projects /FullStack Projects/Projects/AI-Project-Daniel-Machluf/Backend/uploads/DA2ED599-2ED8-42CF-AC46-4F877CC969B3.png'),(35,7,'assistant','I can\'t taste the food, but I can say it looks impressive! Based on the vibrant colors and presentation, it might be quite tasty. If you\'ve tried it, what would you rate it?',871,'2026-05-11 09:06:50','text',NULL),(42,9,'user','hi',NULL,'2026-05-11 09:53:41','text',NULL),(43,9,'assistant','Hello! How can I assist you today?',NULL,'2026-05-11 09:53:41','text',NULL),(44,9,'user','[Image]: analyze this food by total calories',NULL,'2026-05-11 10:25:20','image','/Users/danielmachluf/projects /FullStack Projects/Projects/AI-Project-Daniel-Machluf/Backend/uploads/D2B1A70F-0180-41B3-B882-E9968E7E25EB.jpeg'),(45,9,'assistant','To estimate the total calories in this meal, let\'s break down the components:\n\n1. **Omelet**: \n   - Assuming it is made with two eggs, that\'s roughly 140 calories.\n\n2. **Bread**: \n   - Two small slices of white bread can be around 150 calories.\n\n3. **Tomatoes**: \n   - A serving similar to what\'s shown might be about 30 calories.\n\n4. **Cucumbers**: \n   - They are very low in calories, so around 10 calories.\n\nAdding these together gives an approximate total of **330 calories**. Adjustments might be necessary based on the exact portion sizes and any additional ingredients or cooking methods used.',1311,'2026-05-11 10:25:44','text',NULL);
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personas`
--

DROP TABLE IF EXISTS `personas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `system_prompt` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_persona_name` (`name`),
  KEY `idx_persona_is_default` (`is_default`),
  CONSTRAINT `chk_persona_name_not_empty` CHECK ((char_length(trim(`name`)) > 0)),
  CONSTRAINT `chk_persona_prompt_not_empty` CHECK ((char_length(trim(`system_prompt`)) > 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personas`
--

LOCK TABLES `personas` WRITE;
/*!40000 ALTER TABLE `personas` DISABLE KEYS */;
INSERT INTO `personas` VALUES (1,'Default Assistant','You are a helpful, friendly assistant. Answer clearly and concisely.',1,'2026-05-06 11:11:10'),(2,'Study Assistant','You are a patient study assistant. Break down complex topics into simple steps, use real-world examples, and occasionally ask the user a question to verify they understood.',1,'2026-05-06 11:11:10'),(3,'Code Reviewer','You are a senior software engineer. Review code critically, identify bugs and bad practices, suggest improvements, and always explain the reasoning behind your feedback.',1,'2026-05-06 11:11:10'),(5,'Test Persona Bot','You are Test Persona Bot. Answer clearly in 1–3 sentences, use a friendly tone, append one emoji to each reply, and ask one clarifying question if uncertain.',0,'2026-05-11 09:13:29');
/*!40000 ALTER TABLE `personas` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-12  9:43:39
