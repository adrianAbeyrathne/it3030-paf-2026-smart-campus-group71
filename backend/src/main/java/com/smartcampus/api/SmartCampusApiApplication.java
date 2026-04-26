package com.smartcampus.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@EnableMongoAuditing
@SpringBootApplication
public class SmartCampusApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCampusApiApplication.class, args);
    }
}
