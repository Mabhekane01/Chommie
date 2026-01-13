import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findOneByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ resetPasswordToken: token });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<void> {
    await this.usersRepository.update(id, updateData);
  }

  async addAddress(userId: string, address: any): Promise<User> {
    const user = await this.findOneById(userId);
    if (!user) throw new Error('User not found');

    const newAddress = { ...address, id: Math.random().toString(36).substr(2, 9) };
    const addresses = user.addresses || [];
    
    if (address.isDefault) {
        addresses.forEach(a => a.isDefault = false);
    }
    
    addresses.push(newAddress);
    user.addresses = addresses;
    return this.usersRepository.save(user);
  }

  async removeAddress(userId: string, addressId: string): Promise<User> {
    const user = await this.findOneById(userId);
    if (!user) throw new Error('User not found');

    if (user.addresses) {
        user.addresses = user.addresses.filter(a => a.id !== addressId);
        return this.usersRepository.save(user);
    }
    return user;
  }
}
