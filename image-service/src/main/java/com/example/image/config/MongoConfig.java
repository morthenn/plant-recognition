package com.example.image.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.lang.NonNull;

@Configuration
@EnableMongoRepositories(basePackages = "com.example.image.repository")
public class MongoConfig extends AbstractMongoClientConfiguration {
    
    @Override
    @NonNull
    protected String getDatabaseName() {
        return "imagedb";
    }
} 