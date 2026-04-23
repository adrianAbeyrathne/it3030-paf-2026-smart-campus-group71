package com.smartcampus.api.config;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Date;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

@Configuration
public class MongoConfig {

    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(
                Arrays.asList(LocalDateTimeToDateConverter.INSTANCE, DateToLocalDateTimeConverter.INSTANCE));
    }

    @WritingConverter
    enum LocalDateTimeToDateConverter implements Converter<LocalDateTime, Date> {
        INSTANCE;

        @Override
        public Date convert(LocalDateTime source) {
            return Date.from(source.atZone(ZoneId.systemDefault()).toInstant());
        }
    }

    @ReadingConverter
    enum DateToLocalDateTimeConverter implements Converter<Date, LocalDateTime> {
        INSTANCE;

        @Override
        public LocalDateTime convert(Date source) {
            return LocalDateTime.ofInstant(source.toInstant(), ZoneId.systemDefault());
        }
    }
}
