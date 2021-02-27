import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { UsersRepository } from '../repositories/UsersRepository';
import * as yup from 'yup';
import { AppError } from '../errors/AppError';

class UsersController {
  async show(request: Request, response: Response) {
    const usersRepository = getCustomRepository(UsersRepository);
    const all = await usersRepository.find();

    return response.status(200).json(all);
  }

  async create(request: Request, response: Response) {
    const usersRepository = getCustomRepository(UsersRepository);
    const { name, email } = request.body;

    const schema = yup.object().shape({
      name: yup.string().required(),
      email: yup.string().email().required(),
    }); 

    try {
      await schema.validate(request.body);
    } catch (error) {         
      throw new AppError(error);
    }

    const userAlreadyExists = await usersRepository.findOne({ email })
    if (userAlreadyExists) {
      throw new AppError("User Already Exists");
    }

    const user = usersRepository.create({ name, email });
    await usersRepository.save(user);
    
    return response.status(201).json(user);
  }
};

export { UsersController };