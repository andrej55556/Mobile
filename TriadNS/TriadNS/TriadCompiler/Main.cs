#define TEST
//#define TestDll

using System;
using System.Collections;
using TriadCore;

namespace TriadCompiler
    {

    class ClassMain
        {
        //��������� ���������
        [STAThread]
        static void Main( string[] args )
            {
#if TEST
            //����� ������������
            Test.Start(
                ObjectForTesting.Routine
                                |
                ObjectForTesting.Structure
                                |
                ObjectForTesting.Model
                                |
                ObjectForTesting.InfProcedure
                                |
                ObjectForTesting.SimCondition
                );

#else
#if TestDll
            
    


        D d = new D();
        d.Build();
#else
            //������� �����
            //Input input = new InputFile( @"..\..\Test\File\Routine\Symantic\TestTypeCast.txt" );
            //Input input = new InputFile( @"..\..\Test\File\InfProcedure\Symantic\TestIPHeader.txt" );
            Input input = new InputFile( @"..\..\Test\File\Common.txt" );
            //Input input = new InputFile( @"Design.txt" );
            Output outputConsole = new ConsoleOutput();
            IO ioListing = new IOListing( input, outputConsole );
            //IOTest ioListing = new IOTest( input, outputConsole );
            //CompilerFacade.CompileRoutineToTxt( ioListing, "Out.txt" );
            CompilerFacade.CompileRoutineToTxt(ioListing, "Out.dll");
#endif
#endif
            }
        }
    }
