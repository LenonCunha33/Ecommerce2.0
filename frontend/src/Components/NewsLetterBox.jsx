const NewsLetterBox = () => {
  const onSubmitHandler = (e) => {
    e.preventDefault();
    alert('Inscrição realizada com sucesso!');
  };

  return (
    <div className='text-center'>
      <p className='text-2xl font-medium text-gray-800'>
        Inscreva-se agora e ganhe 20% de desconto
      </p>
      <p className='text-gray-500 mt-3'>
        Seja o primeiro a saber sobre novidades, promoções e descontos!
      </p>

      <form
        onSubmit={onSubmitHandler}
        className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'
      >
        <input
          type='email'
          placeholder='Digite seu e-mail'
          className='w-full sm:flex-1 outline-none '
          required
        />
        <button
          type='submit'
          className='bg-black text-white text-xs px-10 py-4 '
        >
          Inscrever-se
        </button>
      </form>
    </div>
  );
};

export default NewsLetterBox;
