import React from "react";
import Image from "next/image";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";

type Member = {
  name: string;
  email: string;
  role: string;
  image: string;
  description: string;
  instagram?: string;
  x?: string;
  id: number;
  linkedin?: string;
  github?: string;
};

const TeamCard: React.FC<Member> = ({
  name,
  email,
  role,
  image,
  description,
  instagram,
  x,
  linkedin,
  github,
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div
      className="group bg-secondary-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg 
        transform transition-all duration-500 hover:scale-105 hover:bg-secondary-700/50 cursor-pointer"
      onClick={onOpen}
    >
      <div className="relative w-32 h-32 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-600" />
        <div className="absolute inset-1 rounded-full overflow-hidden">
          <Image
            src={image}
            alt={`${name}'s profile`}
            fill
            className="object-cover"
          />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
        {name}
      </h3>
      <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">
        {role}
      </p>

      {/* Social Media Links */}
      <div className="flex justify-center space-x-4">
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-primary-500 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              {/* GitHub Icon */}
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        )}
        {/* diğer svgler */}
      </div>

<Modal
  isOpen={isOpen}
  onOpenChange={onOpenChange}
  className="flex items-center justify-center bg-transparent shadow-lg rounded-xl"
  hideCloseButton
>
  <ModalContent
    className="w-auto h-min bg-gray-800 rounded-xl mx-auto my-auto p-6 space-y-4 shadow-lg"
  >
    {() => (
      <>
        <ModalHeader className="text-primary-400 flex flex-col text-2xl font-semibold text-center">
          {name}
            <p className="text-gray-400 text-lg group-hover:text-gray-300 transition-colors">
                {role}
            </p>
        </ModalHeader>

        <ModalBody className="flex flex-col items-center justify-center space-y-4">
            <img src={image} alt="Avatar" className="w-32 h-32 rounded-full" />
            <p className="text-gray-300 text-center w-60">{description}</p>
            <p className="text-gray-400">
                <strong>Email: </strong>
                <a className='hover:cursor-pointer' href={`mailto:${email}`}>{email}</a>
            </p>
          {/* Additional Info */}
          {/* Add other information here */}
        </ModalBody>

        {/* Footer with Social Links */}
        <ModalFooter className="flex justify-center space-x-4">
          <a
            href="#"
            className="text-primary-500 hover:text-primary-400 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Example icon (GitHub or other social media) */}
              <path d="..." />
            </svg>
          </a>
          {/* Add other links if needed */}
        </ModalFooter>
      </>
    )}
  </ModalContent>
</Modal>

    </div>
  );
};

export default TeamCard;
