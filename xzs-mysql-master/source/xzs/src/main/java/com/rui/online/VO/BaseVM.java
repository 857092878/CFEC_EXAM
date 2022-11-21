package com.rui.online.VO;

import com.rui.online.utils.ModelMapperSingle;
import org.modelmapper.ModelMapper;

/**
 * @version 3.5.0
 * @description: The type Base vm.
 * Copyright (C), 2022-2022, 白色巨塔
 * @date 2022/12/25 9:45
 */
public class BaseVM {
    /**
     * The constant modelMapper.
     */
    protected static ModelMapper modelMapper = ModelMapperSingle.Instance();


    /**
     * Gets model mapper.
     *
     * @return the model mapper
     */
    public static ModelMapper getModelMapper() {
        return modelMapper;
    }

    /**
     * Sets model mapper.
     *
     * @param modelMapper the model mapper
     */
    public static void setModelMapper(ModelMapper modelMapper) {
        BaseVM.modelMapper = modelMapper;
    }
}
